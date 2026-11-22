package main

import (
	"bytes"
	"database/sql"
	"encoding/binary"
	"encoding/json"
	"image"
	"image/jpeg"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/google/uuid"
)

func TestMediaWorkflow(t *testing.T) {
	url := os.Getenv("AIR_TEMPLE_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("requires a temporary PostgreSQL database")
	}
	db, err := sql.Open("pgx", url)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	// A dedicated schema keeps test rows isolated even on repeated runs.
	db.SetMaxOpenConns(1)
	schema := "test_" + uuid.New().String()[:8]
	if _, err = db.Exec("CREATE SCHEMA " + schema); err != nil {
		t.Fatal(err)
	}
	defer db.Exec("DROP SCHEMA " + schema + " CASCADE")
	if _, err = db.Exec("SET search_path TO " + schema); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"001_artworks.sql", "002_artwork_media.sql"} {
		b, err := os.ReadFile("../../migrations/" + name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err = db.Exec(string(b)); err != nil {
			t.Fatal(err)
		}
	}
	root, err := os.OpenRoot(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	defer root.Close()
	a := app{db: db, media: root}
	id := uuid.NewString()
	if _, err = db.Exec("INSERT INTO artworks(id,title,ready) VALUES($1,'test',true)", id); err != nil {
		t.Fatal(err)
	}
	if err = root.MkdirAll("artworks/"+id, 0700); err != nil {
		t.Fatal(err)
	}
	call := func(h http.HandlerFunc, slot string, body []byte, status int) []byte {
		t.Helper()
		r := httptest.NewRequest("GET", "/artworks/"+id+"/media", bytes.NewReader(body))
		r.SetPathValue("id", id)
		r.SetPathValue("slot", slot)
		w := httptest.NewRecorder()
		h(w, r)
		if w.Code != status {
			t.Fatalf("%s: got %d, expected %d: %s", slot, w.Code, status, w.Body.String())
		}
		return w.Body.Bytes()
	}
	var jpg bytes.Buffer
	if err := jpeg.Encode(&jpg, image.NewGray(image.Rect(0, 0, 2, 2)), nil); err != nil {
		t.Fatal(err)
	}
	psd := make([]byte, 42)
	copy(psd, "8BPS")
	psd[5] = 1
	psd[13] = 1
	psd[17] = 1
	psd[21] = 1
	psd[23] = 8
	psd[25] = 1
	video := []byte("\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom")
	binary.BigEndian.PutUint32(video[:4], uint32(len(video)))
	for slot, data := range map[string][]byte{"psd": psd, "video": video, "step-1": jpg.Bytes(), "step-2": jpg.Bytes()} {
		call(a.putMedia, slot, data, 204)
		call(a.mediaFile(false), slot, nil, 404)
		if !bytes.Equal(call(a.mediaFile(true), slot, nil, 200), data) {
			t.Fatal("preview bytes differ")
		}
	}
	call(a.putMedia, "step-1", []byte("invalid"), 400)
	call(a.putMedia, "video", video, 204)
	type entry struct{ ID, Slot string }
	var items []entry
	if err = json.Unmarshal(call(a.mediaList(true), "", nil, 200), &items); err != nil {
		t.Fatal(err)
	}
	var steps []string
	for _, it := range items {
		if it.Slot == "step-1" || it.Slot == "step-2" {
			steps = append(steps, it.ID)
		}
	}
	if len(steps) != 2 {
		t.Fatal(items)
	}
	order, _ := json.Marshal([]string{steps[1], steps[0]})
	call(a.orderSteps, "", order, 204)
	call(a.orderSteps, "", []byte("[]"), 409)
	call(a.publish, "", nil, 204)
	if err = json.Unmarshal(call(a.mediaList(false), "", nil, 200), &items); err != nil {
		t.Fatal(err)
	}
	if len(items) != 4 || items[1].ID != steps[1] || items[2].ID != steps[0] {
		t.Fatal(items)
	}
	if !bytes.Equal(call(a.mediaFile(false), "video", nil, 200), video) {
		t.Fatal("video bytes differ")
	}
	call(a.deleteMedia, "video", nil, 204)
	call(a.mediaFile(false), "video", nil, 404)
}
