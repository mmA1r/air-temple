package gallery

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"image/png"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/google/uuid"
)

const maxPNGBytes = 64 << 20
const maxPixels = 32_000_000
const pageSize = 40

func bearer(r *http.Request) (string, bool) {
	scheme, token, ok := strings.Cut(r.Header.Get("Authorization"), " ")
	return token, ok && strings.EqualFold(scheme, "Bearer") && token != ""
}
func failed(w http.ResponseWriter, op string) {
	log.Print(op)
	http.Error(w, "service unavailable", 503)
}
func originalKey(id string) string { return "artworks/" + id + "/original.png" }

func validPNG(data []byte) bool {
	cfg, err := png.DecodeConfig(bytes.NewReader(data))
	if err != nil || cfg.Width <= 0 || cfg.Height <= 0 || cfg.Width > maxPixels/cfg.Height {
		return false
	}
	_, err = png.Decode(bytes.NewReader(data))
	return err == nil
}

func (a *app) create(w http.ResponseWriter, r *http.Request) {
	title := strings.TrimSpace(r.URL.Query().Get("title"))
	if title == "" || !utf8.ValidString(title) || strings.ContainsRune(title, 0) || utf8.RuneCountInString(title) > 200 {
		http.Error(w, "title must contain 1 to 200 characters", 400)
		return
	}
	data, err := io.ReadAll(http.MaxBytesReader(w, r.Body, maxPNGBytes))
	if err != nil {
		var limit *http.MaxBytesError
		if errors.As(err, &limit) {
			http.Error(w, "PNG too large", 413)
		} else {
			http.Error(w, "incomplete request", 400)
		}
		return
	}
	if !validPNG(data) {
		http.Error(w, "invalid PNG or pixel limit exceeded", 400)
		return
	}
	id := uuid.NewString()
	ctx := r.Context()
	// Reserve the key first so interrupted uploads remain traceable and private.
	_, err = a.db.ExecContext(ctx, "INSERT INTO artworks(id,title) VALUES($1,$2)", id, title)
	if err != nil {
		failed(w, "reserve draft failed")
		return
	}
	err = a.saveOriginal(id, data)
	if err != nil {
		failed(w, "upload draft "+id+" failed")
		return
	}
	_, err = a.db.ExecContext(ctx, "UPDATE artworks SET ready=true WHERE id=$1", id)
	if err != nil {
		failed(w, "finalize draft "+id+" failed")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(map[string]string{"id": id})
}

func artworkID(w http.ResponseWriter, r *http.Request) (string, bool) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.NotFound(w, r)
		return "", false
	}
	return id.String(), true
}
func (a *app) publish(w http.ResponseWriter, r *http.Request) {
	id, ok := artworkID(w, r)
	if !ok {
		return
	}
	var found string
	err := a.db.QueryRowContext(r.Context(), "UPDATE artworks SET published=true WHERE id=$1 AND ready RETURNING id", id).Scan(&found)
	if errors.Is(err, sql.ErrNoRows) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		failed(w, "publish failed")
		return
	}
	w.WriteHeader(204)
}

func (a *app) list(w http.ResponseWriter, r *http.Request) {
	offset := 0
	if v := r.URL.Query().Get("offset"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n < 0 {
			http.Error(w, "invalid offset", 400)
			return
		}
		offset = n
	}
	rows, err := a.db.QueryContext(r.Context(), "SELECT id,title FROM artworks WHERE published ORDER BY created_at DESC,id DESC LIMIT $1 OFFSET $2", pageSize, offset)
	if err != nil {
		failed(w, "gallery query failed")
		return
	}
	defer rows.Close()
	items := []map[string]string{}
	for rows.Next() {
		var id, title string
		if err := rows.Scan(&id, &title); err != nil {
			failed(w, "gallery row failed")
			return
		}
		items = append(items, map[string]string{"id": id, "title": title, "original": "/artworks/" + id + "/original"})
	}
	if rows.Err() != nil {
		failed(w, "gallery read failed")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (a *app) accessible(w http.ResponseWriter, r *http.Request, author bool) (string, bool) {
	id, ok := artworkID(w, r)
	if !ok {
		return "", false
	}
	var exists bool
	err := a.db.QueryRowContext(r.Context(), "SELECT EXISTS(SELECT FROM artworks WHERE id=$1 AND ready AND (published OR $2))", id, author).Scan(&exists)
	if err != nil {
		failed(w, "artwork lookup failed")
		return "", false
	}
	if !exists {
		http.NotFound(w, r)
		return "", false
	}
	return id, true
}
func (a *app) download(w http.ResponseWriter, r *http.Request) {
	id, ok := a.accessible(w, r, false)
	if !ok {
		return
	}
	a.serveOriginal(w, r, id, true)
}
func (a *app) preview(w http.ResponseWriter, r *http.Request) {
	id, ok := a.accessible(w, r, true)
	if !ok {
		return
	}
	a.serveOriginal(w, r, id, false)
}

func (a *app) saveOriginal(id string, data []byte) error {
	name := originalKey(id)
	if err := a.media.MkdirAll(filepath.Dir(name), 0700); err != nil {
		return err
	}
	f, err := a.media.OpenFile(name, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0600)
	if err != nil {
		return err
	}
	_, err = f.Write(data)
	if err == nil {
		err = f.Sync()
	}
	return errors.Join(err, f.Close())
}

func (a *app) serveOriginal(w http.ResponseWriter, r *http.Request, id string, download bool) {
	a.serveFile(w, r, originalKey(id), id+".png", "image/png", download)
}

func (a *app) serveFile(w http.ResponseWriter, r *http.Request, path, name, contentType string, download bool) {
	f, err := a.media.Open(path)
	if err != nil {
		failed(w, "open media failed")
		return
	}
	defer f.Close()
	info, err := f.Stat()
	if err != nil || !info.Mode().IsRegular() {
		failed(w, "stat media failed")
		return
	}
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("X-Content-Type-Options", "nosniff")
	if download {
		w.Header().Set("Content-Disposition", "attachment; filename="+name)
		w.Header().Add("Cache-Control", "no-store")
	}
	http.ServeContent(w, r, name, info.ModTime(), f)
}
