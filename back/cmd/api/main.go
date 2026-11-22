package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"google.golang.org/api/idtoken"
)

type app struct {
	db               *sql.DB
	media            *os.Root
	audience, author string
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
func run() error {
	for _, name := range []string{"DATABASE_URL", "MEDIA_DIR", "GOOGLE_CLIENT_ID", "GOOGLE_AUTHOR_SUB"} {
		if os.Getenv(name) == "" {
			return fmt.Errorf("missing %s", name)
		}
	}
	db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))
	if err != nil {
		return errors.New("invalid database configuration")
	}
	defer db.Close()
	db.SetMaxOpenConns(10)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	err = db.PingContext(ctx)
	cancel()
	if err != nil {
		return errors.New("PostgreSQL unavailable")
	}
	media, err := os.OpenRoot(os.Getenv("MEDIA_DIR"))
	if err != nil {
		return fmt.Errorf("open media directory: %w", err)
	}
	defer media.Close()
	a := app{db: db, media: media, audience: os.Getenv("GOOGLE_CLIENT_ID"), author: os.Getenv("GOOGLE_AUTHOR_SUB")}
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
	addr := os.Getenv("LISTEN_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8080"
	}
	server := http.Server{Addr: addr, Handler: mux, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 5 * time.Minute, WriteTimeout: 5 * time.Minute, IdleTimeout: time.Minute}
	stop, unsubscribe := signal.NotifyContext(context.Background(), os.Interrupt)
	defer unsubscribe()
	done := make(chan error, 1)
	go func() { done <- server.ListenAndServe() }()
	select {
	case err := <-done:
		return err
	case <-stop.Done():
	}
	shutdown, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	return server.Shutdown(shutdown)
}

func (a *app) admin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "private, no-store")
		token, ok := bearer(r)
		if !ok {
			http.Error(w, "Google ID token required", 401)
			return
		}
		claims, err := idtoken.Validate(r.Context(), token, a.audience)
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
