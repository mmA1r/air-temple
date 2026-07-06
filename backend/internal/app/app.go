package app

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"air-temple/backend/internal/auth"
	"air-temple/backend/internal/config"
	"air-temple/backend/internal/ids"
	"air-temple/backend/internal/imageprocessor"
	"air-temple/backend/internal/models"
	"air-temple/backend/internal/repository"
	"air-temple/backend/internal/storage"

	"github.com/jackc/pgx/v5/pgxpool"
)

type App struct {
	cfg        config.Config
	db         *pgxpool.Pool
	repository *repository.Repository
	storage    *storage.Client
	auth       *auth.Service
}

func New(ctx context.Context, cfg config.Config) (*App, error) {
	db, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(ctx); err != nil {
		db.Close()
		return nil, err
	}

	storageClient, err := storage.New(ctx, cfg)
	if err != nil {
		db.Close()
		return nil, err
	}

	app := &App{
		cfg:     cfg,
		db:      db,
		storage: storageClient,
		auth:    auth.New(cfg.AdminUsername, cfg.AdminPassword),
	}
	app.repository = repository.New(db, storageClient.PublicURL)

	return app, nil
}

func (app *App) Close() {
	app.db.Close()
}

func (app *App) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", app.handleHealth)
	mux.HandleFunc("/api/years", app.handleYears)
	mux.HandleFunc("/api/artworks", app.handleArtworks)
	mux.HandleFunc("/api/artworks/", app.handleArtwork)
	mux.HandleFunc("/api/downloads/", app.handleDownload)
	mux.HandleFunc("/api/admin/login", app.handleAdminLogin)
	mux.HandleFunc("/api/admin/logout", app.withAdmin(app.handleAdminLogout))
	mux.HandleFunc("/api/admin/artworks", app.withAdmin(app.handleAdminArtworks))
	mux.HandleFunc("/api/admin/artworks/", app.withAdmin(app.handleAdminArtwork))
	mux.HandleFunc("/api/admin/assets", app.withAdmin(app.handleAdminAssets))
	mux.HandleFunc("/api/admin/assets/", app.withAdmin(app.handleAdminAsset))

	return app.withCORS(mux)
}

func (app *App) handleHealth(response http.ResponseWriter, request *http.Request) {
	writeJSON(response, http.StatusOK, map[string]string{"status": "ok"})
}

func (app *App) handleYears(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodGet {
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	years, err := app.repository.Years(request.Context())
	if err != nil {
		writeError(response, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(response, http.StatusOK, years)
}

func (app *App) handleArtworks(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodGet {
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var year *int
	if rawYear := request.URL.Query().Get("year"); rawYear != "" {
		parsedYear, err := strconv.Atoi(rawYear)
		if err != nil {
			writeError(response, http.StatusBadRequest, "invalid year")
			return
		}
		year = &parsedYear
	}

	locale := repository.NormalizeLocale(request.URL.Query().Get("locale"))
	artworks, err := app.repository.PublicArtworks(request.Context(), locale, year)
	if err != nil {
		writeError(response, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(response, http.StatusOK, artworks)
}

func (app *App) handleArtwork(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodGet {
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	slug := strings.TrimPrefix(request.URL.Path, "/api/artworks/")
	if slug == "" {
		writeError(response, http.StatusNotFound, "not found")
		return
	}

	artwork, err := app.repository.PublicArtwork(request.Context(), slug, repository.NormalizeLocale(request.URL.Query().Get("locale")))
	if err != nil {
		writeRepositoryError(response, err)
		return
	}

	writeJSON(response, http.StatusOK, artwork)
}

func (app *App) handleDownload(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	assetID := strings.TrimPrefix(request.URL.Path, "/api/downloads/")
	asset, err := app.repository.Asset(request.Context(), assetID)
	if err != nil {
		writeRepositoryError(response, err)
		return
	}

	if asset.Visibility == "public" {
		writeJSON(response, http.StatusOK, map[string]string{"url": asset.URL})
		return
	}

	url, err := app.storage.SignedURL(request.Context(), asset)
	if err != nil {
		writeError(response, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(response, http.StatusOK, map[string]string{"url": url})
}

func (app *App) handleAdminLogin(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var payload struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeError(response, http.StatusBadRequest, "invalid payload")
		return
	}

	token, ok := app.auth.Login(payload.Username, payload.Password)
	if !ok {
		writeError(response, http.StatusUnauthorized, "invalid credentials")
		return
	}

	writeJSON(response, http.StatusOK, map[string]string{"token": token})
}

func (app *App) handleAdminLogout(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	app.auth.Logout(readBearerToken(request))
	response.WriteHeader(http.StatusNoContent)
}

func (app *App) handleAdminArtworks(response http.ResponseWriter, request *http.Request) {
	switch request.Method {
	case http.MethodGet:
		artworks, err := app.repository.AdminArtworks(request.Context())
		if err != nil {
			writeError(response, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(response, http.StatusOK, artworks)
	case http.MethodPost:
		input, ok := decodeArtworkInput(response, request)
		if !ok {
			return
		}
		artwork, err := app.repository.CreateArtwork(request.Context(), input)
		if err != nil {
			writeError(response, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(response, http.StatusCreated, artwork)
	default:
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (app *App) handleAdminArtwork(response http.ResponseWriter, request *http.Request) {
	id := strings.TrimPrefix(request.URL.Path, "/api/admin/artworks/")
	if id == "" {
		writeError(response, http.StatusNotFound, "not found")
		return
	}

	switch request.Method {
	case http.MethodPatch:
		input, ok := decodeArtworkInput(response, request)
		if !ok {
			return
		}
		artwork, err := app.repository.UpdateArtwork(request.Context(), id, input)
		if err != nil {
			writeRepositoryError(response, err)
			return
		}
		writeJSON(response, http.StatusOK, artwork)
	case http.MethodDelete:
		if err := app.repository.DeleteArtwork(request.Context(), id); err != nil {
			writeRepositoryError(response, err)
			return
		}
		response.WriteHeader(http.StatusNoContent)
	default:
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (app *App) handleAdminAssets(response http.ResponseWriter, request *http.Request) {
	switch request.Method {
	case http.MethodGet:
		assets, err := app.repository.Assets(request.Context())
		if err != nil {
			writeError(response, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(response, http.StatusOK, assets)
	case http.MethodPost:
		app.handleAssetUpload(response, request)
	default:
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (app *App) handleAdminAsset(response http.ResponseWriter, request *http.Request) {
	pathValue := strings.TrimPrefix(request.URL.Path, "/api/admin/assets/")

	if strings.HasSuffix(pathValue, "/regenerate") {
		id := strings.TrimSuffix(pathValue, "/regenerate")
		app.handleAssetRegenerate(response, request, id)
		return
	}

	switch request.Method {
	case http.MethodDelete:
		asset, err := app.repository.DeleteAsset(request.Context(), pathValue)
		if err != nil {
			writeRepositoryError(response, err)
			return
		}
		_ = app.storage.Delete(request.Context(), asset.StorageKey)
		for _, variant := range asset.Variants {
			_ = app.storage.Delete(request.Context(), variant.Name)
		}
		response.WriteHeader(http.StatusNoContent)
	default:
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (app *App) handleAssetUpload(response http.ResponseWriter, request *http.Request) {
	if err := request.ParseMultipartForm(128 << 20); err != nil {
		writeError(response, http.StatusBadRequest, "invalid multipart form")
		return
	}

	file, header, err := request.FormFile("file")
	if err != nil {
		writeError(response, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		writeError(response, http.StatusBadRequest, "could not read file")
		return
	}

	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = http.DetectContentType(data)
	}

	assetType := request.FormValue("type")
	if assetType == "" {
		assetType = "preview"
	}

	visibility := request.FormValue("visibility")
	if visibility != "private" {
		visibility = "public"
	}

	key := fmt.Sprintf("originals/%s/%s", ids.New(), header.Filename)
	if err := app.storage.Put(request.Context(), key, contentType, storage.ReaderFromBytes(data)); err != nil {
		writeError(response, http.StatusInternalServerError, err.Error())
		return
	}

	asset := models.Asset{
		Type:             assetType,
		OriginalFileName: header.Filename,
		MimeType:         contentType,
		Size:             header.Size,
		StorageKey:       key,
		Visibility:       visibility,
		ProcessingStatus: "pending",
		Variants:         []models.AssetVariant{},
	}

	createdAsset, err := app.repository.CreateAsset(request.Context(), asset)
	if err != nil {
		writeError(response, http.StatusBadRequest, err.Error())
		return
	}

	createdAsset, err = app.generatePreview(request.Context(), createdAsset, data)
	if err != nil {
		createdAsset, _ = app.repository.UpdateAssetProcessing(request.Context(), createdAsset.ID, "failed", createdAsset.Variants)
	}

	writeJSON(response, http.StatusCreated, createdAsset)
}

func (app *App) handleAssetRegenerate(response http.ResponseWriter, request *http.Request, id string) {
	if request.Method != http.MethodPost {
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	asset, err := app.repository.Asset(request.Context(), id)
	if err != nil {
		writeRepositoryError(response, err)
		return
	}

	data, err := app.storage.Get(request.Context(), asset.StorageKey)
	if err != nil {
		writeError(response, http.StatusInternalServerError, err.Error())
		return
	}

	asset, err = app.generatePreview(request.Context(), asset, data)
	if err != nil {
		asset, _ = app.repository.UpdateAssetProcessing(request.Context(), asset.ID, "failed", asset.Variants)
	}

	writeJSON(response, http.StatusOK, asset)
}

func (app *App) generatePreview(ctx context.Context, asset models.Asset, data []byte) (models.Asset, error) {
	variantKey := fmt.Sprintf("previews/%s-web", asset.ID)
	if strings.Contains(asset.MimeType, "png") {
		variantKey += ".png"
	} else {
		variantKey += ".jpg"
	}

	preview, variant, generated, err := imageprocessor.GeneratePreview(data, asset.MimeType, variantKey)
	if err != nil {
		return asset, err
	}

	if !generated {
		return app.repository.UpdateAssetProcessing(ctx, asset.ID, "ready", asset.Variants)
	}

	if err := app.storage.Put(ctx, variantKey, asset.MimeType, storage.ReaderFromBytes(preview)); err != nil {
		return asset, err
	}

	variant.URL = app.storage.PublicURL(models.Asset{StorageKey: variantKey, Visibility: "public"})
	asset.Variants = []models.AssetVariant{variant}

	return app.repository.UpdateAssetProcessing(ctx, asset.ID, "ready", asset.Variants)
}

func (app *App) withAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		if !app.auth.IsValid(readBearerToken(request)) {
			writeError(response, http.StatusUnauthorized, "unauthorized")
			return
		}

		next(response, request)
	}
}

func (app *App) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		response.Header().Set("Access-Control-Allow-Origin", app.cfg.CORSOrigin)
		response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")

		if request.Method == http.MethodOptions {
			response.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(response, request)
	})
}

func decodeArtworkInput(response http.ResponseWriter, request *http.Request) (models.ArtworkInput, bool) {
	var input models.ArtworkInput
	if err := json.NewDecoder(request.Body).Decode(&input); err != nil {
		writeError(response, http.StatusBadRequest, "invalid payload")
		return input, false
	}

	if input.Slug == "" || input.Year == 0 {
		writeError(response, http.StatusBadRequest, "slug and year are required")
		return input, false
	}

	if input.Status != "published" {
		input.Status = "draft"
	}

	return input, true
}

func readBearerToken(request *http.Request) string {
	header := request.Header.Get("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}

	return strings.TrimPrefix(header, "Bearer ")
}

func writeRepositoryError(response http.ResponseWriter, err error) {
	if repository.IsNotFound(err) {
		writeError(response, http.StatusNotFound, "not found")
		return
	}

	writeError(response, http.StatusInternalServerError, err.Error())
}

func writeJSON(response http.ResponseWriter, status int, payload any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)

	if err := json.NewEncoder(response).Encode(payload); err != nil && !errors.Is(err, http.ErrHandlerTimeout) {
		http.Error(response, err.Error(), http.StatusInternalServerError)
	}
}

func writeError(response http.ResponseWriter, status int, message string) {
	http.Error(response, message, status)
}
