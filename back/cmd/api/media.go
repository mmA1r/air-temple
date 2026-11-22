package main

import (
	"context"
	"database/sql"
	"encoding/binary"
	"encoding/json"
	"errors"
	"image/jpeg"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

type mediaType struct {
	ext, mime string
	limit     int64
}

var mediaTypes = map[string]mediaType{
	"psd":   {"psd", "image/vnd.adobe.photoshop", 2 << 30},
	"video": {"mp4", "video/mp4", 4 << 30},
	"step":  {"jpg", "image/jpeg", 32 << 20},
}

type slot struct {
	kind     string
	position int
}

func parseSlot(s string) (slot, bool) {
	if s == "psd" || s == "video" {
		return slot{s, 0}, true
	}
	raw, ok := strings.CutPrefix(s, "step-")
	n, err := strconv.ParseInt(raw, 10, 32)
	return slot{"step", int(n)}, ok && err == nil && n > 0 && strconv.FormatInt(n, 10) == raw
}
func (s slot) name() string {
	if s.kind == "step" {
		return "step-" + strconv.Itoa(s.position)
	}
	return s.kind
}
func filePath(id, file string) string { return "artworks/" + id + "/" + file }

func validMedia(f *os.File, kind string) bool {
	switch kind {
	case "step":
		cfg, err := jpeg.DecodeConfig(f)
		if err != nil || cfg.Height <= 0 || cfg.Width <= 0 || cfg.Width > maxPixels/cfg.Height {
			return false
		}
		if _, err = f.Seek(0, io.SeekStart); err != nil {
			return false
		}
		_, err = jpeg.Decode(f)
		return err == nil
	case "psd":
		var h [26]byte
		if _, err := io.ReadFull(f, h[:]); err != nil {
			return false
		}
		channels := binary.BigEndian.Uint16(h[12:])
		height := binary.BigEndian.Uint32(h[14:])
		width := binary.BigEndian.Uint32(h[18:])
		depth := binary.BigEndian.Uint16(h[22:])
		return string(h[:4]) == "8BPS" && binary.BigEndian.Uint16(h[4:]) == 1 && channels >= 1 && channels <= 56 && width >= 1 && width <= 30000 && height >= 1 && height <= 30000 && (depth == 1 || depth == 8 || depth == 16 || depth == 32)
	case "video":
		var h [512]byte
		n, err := io.ReadFull(f, h[:])
		return (err == nil || err == io.ErrUnexpectedEOF) && http.DetectContentType(h[:n]) == "video/mp4"
	}
	return false
}

func (a *app) mediaList(author bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, ok := a.accessible(w, r, author)
		if !ok {
			return
		}
		rows, err := a.db.QueryContext(r.Context(), "SELECT kind,position,file_id FROM artwork_media WHERE artwork_id=$1 ORDER BY kind,position", id)
		if err != nil {
			failed(w, "list attachments failed")
			return
		}
		defer rows.Close()
		type item struct {
			ID   string `json:"id"`
			Slot string `json:"slot"`
			URL  string `json:"url"`
		}
		items := []item{}
		for rows.Next() {
			var s slot
			var file string
			if err := rows.Scan(&s.kind, &s.position, &file); err != nil {
				failed(w, "read attachment failed")
				return
			}
			name := s.name()
			items = append(items, item{file, name, strings.TrimSuffix(r.URL.Path, "/") + "/" + name})
		}
		if rows.Err() != nil {
			failed(w, "list attachments incomplete")
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(items)
	}
}
func (a *app) mediaFile(author bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		s, ok := parseSlot(r.PathValue("slot"))
		if !ok {
			http.NotFound(w, r)
			return
		}
		id, ok := a.accessible(w, r, author)
		if !ok {
			return
		}
		var file string
		err := a.db.QueryRowContext(r.Context(), "SELECT file_id FROM artwork_media WHERE artwork_id=$1 AND kind=$2 AND position=$3", id, s.kind, s.position).Scan(&file)
		if errors.Is(err, sql.ErrNoRows) {
			http.NotFound(w, r)
			return
		}
		if err != nil {
			failed(w, "look up attachment failed")
			return
		}
		t := mediaTypes[s.kind]
		a.serveFile(w, r, filePath(id, file), id+"-"+s.name()+"."+t.ext, t.mime, s.kind == "psd" || r.URL.Query().Get("download") == "1")
	}
}

// Every metadata change locks the parent so reorders and replacements serialize.
func (a *app) editMedia(ctx context.Context, id string, edit func(*sql.Tx) error) error {
	tx, err := a.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var locked string
	if err = tx.QueryRowContext(ctx, "SELECT id FROM artworks WHERE id=$1 AND ready FOR UPDATE", id).Scan(&locked); err != nil {
		return err
	}
	if err = edit(tx); err != nil {
		return err
	}
	return tx.Commit()
}
func (a *app) deleteMedia(w http.ResponseWriter, r *http.Request) {
	id, ok := a.accessible(w, r, true)
	if !ok {
		return
	}
	s, ok := parseSlot(r.PathValue("slot"))
	if !ok {
		http.NotFound(w, r)
		return
	}
	var retired string
	err := a.editMedia(r.Context(), id, func(tx *sql.Tx) error { return unlinkSlot(r.Context(), tx, id, s, &retired) })
	if err != nil {
		failed(w, "remove attachment failed")
		return
	}
	a.removeRetired(id, retired)
	w.WriteHeader(204)
}
func unlinkSlot(ctx context.Context, tx *sql.Tx, id string, s slot, retired *string) error {
	err := tx.QueryRowContext(ctx, "DELETE FROM artwork_media WHERE artwork_id=$1 AND kind=$2 AND position=$3 RETURNING file_id", id, s.kind, s.position).Scan(retired)
	if errors.Is(err, sql.ErrNoRows) {
		return nil
	}
	return err
}
func (a *app) removeRetired(id, file string) {
	if file != "" {
		if err := a.media.Remove(filePath(id, file)); err != nil && !errors.Is(err, os.ErrNotExist) {
			log.Printf("retired attachment %s needs cleanup: %v", file, err)
		}
	}
}
func (a *app) putMedia(w http.ResponseWriter, r *http.Request) {
	id, ok := a.accessible(w, r, true)
	if !ok {
		return
	}
	s, ok := parseSlot(r.PathValue("slot"))
	if !ok {
		http.NotFound(w, r)
		return
	}
	limit := mediaTypes[s.kind].limit
	if r.ContentLength > limit {
		http.Error(w, "attachment too large", 413)
		return
	}
	file := uuid.NewString()
	path := filePath(id, file)
	f, err := a.media.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_RDWR, 0600)
	if err != nil {
		failed(w, "create attachment file failed")
		return
	}
	// After a commit attempt the database outcome may be ambiguous. Retain the
	// file for reconciliation rather than risking a reference to a missing file.
	retain := false
	defer func() {
		if !retain {
			a.removeRetired(id, file)
		}
	}()
	defer f.Close()
	_, err = io.Copy(f, http.MaxBytesReader(w, r.Body, limit))
	if err != nil {
		var size *http.MaxBytesError
		if errors.As(err, &size) {
			http.Error(w, "attachment too large", 413)
		} else {
			failed(w, "write attachment interrupted")
		}
		return
	}
	if _, err = f.Seek(0, io.SeekStart); err != nil {
		failed(w, "seek attachment failed")
		return
	}
	if !validMedia(f, s.kind) {
		http.Error(w, "invalid attachment format", 400)
		return
	}
	if err = f.Sync(); err != nil {
		failed(w, "sync attachment failed")
		return
	}
	ctx := r.Context()
	var retired string
	err = a.editMedia(ctx, id, func(tx *sql.Tx) error {
		if err := unlinkSlot(ctx, tx, id, s, &retired); err != nil {
			return err
		}
		_, err := tx.ExecContext(ctx, "INSERT INTO artwork_media(artwork_id,kind,position,file_id) VALUES($1,$2,$3,$4)", id, s.kind, s.position, file)
		retain = err == nil
		return err
	})
	if err != nil {
		failed(w, "save attachment metadata failed")
		return
	}
	a.removeRetired(id, retired)
	w.WriteHeader(204)
}

var errSequence = errors.New("step list has changed or contains invalid IDs")

func (a *app) orderSteps(w http.ResponseWriter, r *http.Request) {
	id, ok := a.accessible(w, r, true)
	if !ok {
		return
	}
	data, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
	var ids []string
	if err != nil || json.Unmarshal(data, &ids) != nil || ids == nil {
		http.Error(w, "expected a JSON array of step IDs", 400)
		return
	}
	seen := map[string]bool{}
	for _, v := range ids {
		parsed, err := uuid.Parse(v)
		if err != nil || parsed.String() != v || seen[v] {
			http.Error(w, "invalid or duplicate step ID", 400)
			return
		}
		seen[v] = true
	}
	ctx := r.Context()
	err = a.editMedia(ctx, id, func(tx *sql.Tx) error {
		var count int
		if err := tx.QueryRowContext(ctx, "SELECT count(*) FROM artwork_media WHERE artwork_id=$1 AND kind='step'", id).Scan(&count); err != nil {
			return err
		}
		if count != len(ids) {
			return errSequence
		}
		if _, err := tx.ExecContext(ctx, "SET CONSTRAINTS artwork_media_pkey DEFERRED"); err != nil {
			return err
		}
		result, err := tx.ExecContext(ctx, `UPDATE artwork_media m SET position=ordered.pos::integer FROM unnest($2::text[]) WITH ORDINALITY AS ordered(file,pos) WHERE m.artwork_id=$1 AND m.kind='step' AND m.file_id=ordered.file::uuid`, id, ids)
		if err != nil {
			return err
		}
		n, err := result.RowsAffected()
		if err != nil {
			return err
		}
		if n != int64(count) {
			return errSequence
		}
		return nil
	})
	if errors.Is(err, errSequence) {
		http.Error(w, err.Error(), 409)
		return
	}
	if err != nil {
		failed(w, "reorder steps failed")
		return
	}
	w.WriteHeader(204)
}
