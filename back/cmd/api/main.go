package main

import (
	"airtemple/internal/gallery"
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
	mux := gallery.NewHandler(db, media, os.Getenv("GOOGLE_CLIENT_ID"), os.Getenv("GOOGLE_AUTHOR_SUB"), idtoken.Validate)
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
