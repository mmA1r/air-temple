package tests

import (
	"airtemple/internal/gallery"
	"bytes"
	"context"
	"database/sql"
	"errors"
	"google.golang.org/api/idtoken"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func testHandler(db *sql.DB, media *os.Root) http.Handler {
	return gallery.NewHandler(db, media, "gallery", "author", func(ctx context.Context, token, audience string) (*idtoken.Payload, error) {
		if token != "test-author" || audience != "gallery" {
			return nil, errors.New("unexpected test credential")
		}
		return &idtoken.Payload{Subject: "author", Issuer: "https://accounts.google.com"}, nil
	})
}
func TestAnonymousPreviewDenied(t *testing.T) {
	w := httptest.NewRecorder()
	testHandler(nil, nil).ServeHTTP(w, httptest.NewRequest("GET", "/admin/artworks/123/original", nil))
	if w.Code != 401 || w.Header().Get("Cache-Control") != "private, no-store" {
		t.Fatal(w.Result())
	}
}
func TestInvalidOriginalRejected(t *testing.T) {
	r := httptest.NewRequest("POST", "/admin/artworks?title=test", bytes.NewReader([]byte("\x89PNG\r\n\x1a\n")))
	r.Header.Set("Authorization", "Bearer test-author")
	w := httptest.NewRecorder()
	testHandler(nil, nil).ServeHTTP(w, r)
	if w.Code != 400 {
		t.Fatal(w.Result())
	}
}
