package main

import (
	"bytes"
	"image"
	"image/png"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestOriginalValidation(t *testing.T) {
	var original bytes.Buffer
	if err := png.Encode(&original, image.NewRGBA(image.Rect(0, 0, 10, 10))); err != nil {
		t.Fatal(err)
	}
	if !validPNG(original.Bytes()) {
		t.Fatal("valid PNG rejected")
	}
	if validPNG(original.Bytes()[:original.Len()-5]) {
		t.Fatal("truncated PNG accepted")
	}
}

func TestAnonymousPreviewDenied(t *testing.T) {
	a := app{}
	response := httptest.NewRecorder()
	a.admin(func(http.ResponseWriter, *http.Request) { t.Fatal("anonymous request reached draft handler") })(response, httptest.NewRequest("GET", "/admin/artworks/123/original", nil))
	if response.Code != 401 || response.Header().Get("Cache-Control") != "private, no-store" {
		t.Fatal(response.Result())
	}
}
func TestStoredOriginalDownload(t *testing.T) {
	root, err := os.OpenRoot(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	defer root.Close()
	a := app{media: root}
	id := "080992d2-50f4-4462-a04d-a3b81c870734"
	var pngData bytes.Buffer
	if err := png.Encode(&pngData, image.NewRGBA(image.Rect(0, 0, 4, 4))); err != nil {
		t.Fatal(err)
	}
	if err := a.saveOriginal(id, pngData.Bytes()); err != nil {
		t.Fatal(err)
	}
	if err := a.saveOriginal(id, []byte("replacement")); err == nil {
		t.Fatal("existing original overwritten")
	}
	w := httptest.NewRecorder()
	a.serveOriginal(w, httptest.NewRequest("GET", "/artworks/"+id+"/original", nil), id, true)
	if w.Code != 200 || !bytes.Equal(w.Body.Bytes(), pngData.Bytes()) || w.Header().Get("Content-Disposition") != "attachment; filename="+id+".png" {
		t.Fatal("download did not preserve the original attachment")
	}
}
