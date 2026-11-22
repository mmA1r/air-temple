package gallery

import (
	"context"
	"database/sql"
	"google.golang.org/api/idtoken"
	"net/http"
	"os"
)

type app struct {
	db               *sql.DB
	media            *os.Root
	audience, author string
	validate         func(context.Context, string, string) (*idtoken.Payload, error)
}

func NewHandler(db *sql.DB, media *os.Root, audience, author string, validate func(context.Context, string, string) (*idtoken.Payload, error)) http.Handler {
	a := app{db: db, media: media, audience: audience, author: author, validate: validate}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /artworks", a.list)
	mux.HandleFunc("GET /artworks/{id}/original", a.download)
	mux.HandleFunc("POST /admin/artworks", a.admin(a.create))
	mux.HandleFunc("GET /admin/artworks/{id}/original", a.admin(a.preview))
	mux.HandleFunc("POST /admin/artworks/{id}/publish", a.admin(a.publish))
	mux.HandleFunc("GET /artworks/{id}/media", a.mediaList(false))
	mux.HandleFunc("GET /artworks/{id}/media/{slot}", a.mediaFile(false))
	mux.HandleFunc("GET /admin/artworks/{id}/media", a.admin(a.mediaList(true)))
	mux.HandleFunc("GET /admin/artworks/{id}/media/{slot}", a.admin(a.mediaFile(true)))
	mux.HandleFunc("PUT /admin/artworks/{id}/media/{slot}", a.admin(a.putMedia))
	mux.HandleFunc("DELETE /admin/artworks/{id}/media/{slot}", a.admin(a.deleteMedia))
	mux.HandleFunc("PUT /admin/artworks/{id}/step-order", a.admin(a.orderSteps))
	return mux
}
func (a *app) admin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "private, no-store")
		token, ok := bearer(r)
		if !ok {
			http.Error(w, "Google ID token required", 401)
			return
		}
		claims, err := a.validate(r.Context(), token, a.audience)
		if err != nil || (claims.Issuer != "accounts.google.com" && claims.Issuer != "https://accounts.google.com") {
			http.Error(w, "invalid Google ID token", 401)
			return
		}
		if claims.Subject != a.author {
			http.Error(w, "author access required", 403)
			return
		}
		next(w, r)
	}
}
