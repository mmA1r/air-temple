package repository

import (
	"context"
	"encoding/json"
	"errors"

	"air-temple/backend/internal/ids"
	"air-temple/backend/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db        *pgxpool.Pool
	publicURL func(asset models.Asset) string
}

func New(db *pgxpool.Pool, publicURL func(asset models.Asset) string) *Repository {
	return &Repository{db: db, publicURL: publicURL}
}

func (repository *Repository) Years(ctx context.Context) ([]int, error) {
	rows, err := repository.db.Query(ctx, "SELECT DISTINCT year FROM artworks WHERE status = 'published' ORDER BY year DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	years := make([]int, 0)
	for rows.Next() {
		var year int
		if err := rows.Scan(&year); err != nil {
			return nil, err
		}
		years = append(years, year)
	}

	return years, rows.Err()
}

func (repository *Repository) PublicArtworks(ctx context.Context, locale models.Locale, year *int) ([]models.Artwork, error) {
	query := "SELECT id, slug, year, title_ru, title_en, description_ru, description_en, tags, status, sort_order, cover_asset_id FROM artworks WHERE status = 'published'"
	args := []any{}

	if year != nil {
		args = append(args, *year)
		query += " AND year = $1"
	}

	query += " ORDER BY year DESC, sort_order ASC, created_at DESC"

	rows, err := repository.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return repository.scanArtworkRows(ctx, rows, locale)
}

func (repository *Repository) PublicArtwork(ctx context.Context, slug string, locale models.Locale) (models.Artwork, error) {
	return repository.artworkByClause(ctx, "slug = $1 AND status = 'published'", []any{slug}, locale)
}

func (repository *Repository) AdminArtworks(ctx context.Context) ([]models.Artwork, error) {
	rows, err := repository.db.Query(ctx, "SELECT id, slug, year, title_ru, title_en, description_ru, description_en, tags, status, sort_order, cover_asset_id FROM artworks ORDER BY year DESC, sort_order ASC, created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return repository.scanArtworkRows(ctx, rows, models.LocaleRU)
}

func (repository *Repository) CreateArtwork(ctx context.Context, input models.ArtworkInput) (models.Artwork, error) {
	id := ids.New()
	_, err := repository.db.Exec(
		ctx,
		`INSERT INTO artworks (id, slug, year, title_ru, title_en, description_ru, description_en, tags, status, sort_order, cover_asset_id)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
		id,
		input.Slug,
		input.Year,
		input.TitleRU,
		input.TitleEN,
		input.DescriptionRU,
		input.DescriptionEN,
		input.Tags,
		input.Status,
		input.SortOrder,
		input.CoverAssetID,
	)
	if err != nil {
		return models.Artwork{}, err
	}

	if err := repository.syncArtworkAssets(ctx, id, input); err != nil {
		return models.Artwork{}, err
	}

	return repository.artworkByClause(ctx, "id = $1", []any{id}, models.LocaleRU)
}

func (repository *Repository) UpdateArtwork(ctx context.Context, id string, input models.ArtworkInput) (models.Artwork, error) {
	result, err := repository.db.Exec(
		ctx,
		`UPDATE artworks
		 SET slug = $2, year = $3, title_ru = $4, title_en = $5, description_ru = $6, description_en = $7,
		     tags = $8, status = $9, sort_order = $10, cover_asset_id = $11, updated_at = now()
		 WHERE id = $1`,
		id,
		input.Slug,
		input.Year,
		input.TitleRU,
		input.TitleEN,
		input.DescriptionRU,
		input.DescriptionEN,
		input.Tags,
		input.Status,
		input.SortOrder,
		input.CoverAssetID,
	)
	if err != nil {
		return models.Artwork{}, err
	}

	if result.RowsAffected() == 0 {
		return models.Artwork{}, pgx.ErrNoRows
	}

	if err := repository.syncArtworkAssets(ctx, id, input); err != nil {
		return models.Artwork{}, err
	}

	return repository.artworkByClause(ctx, "id = $1", []any{id}, models.LocaleRU)
}

func (repository *Repository) DeleteArtwork(ctx context.Context, id string) error {
	result, err := repository.db.Exec(ctx, "DELETE FROM artworks WHERE id = $1", id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}

	return nil
}

func (repository *Repository) Assets(ctx context.Context) ([]models.Asset, error) {
	rows, err := repository.db.Query(ctx, "SELECT id, type, original_file_name, mime_type, size, storage_key, visibility, processing_status, variants FROM assets ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return repository.scanAssets(rows)
}

func (repository *Repository) Asset(ctx context.Context, id string) (models.Asset, error) {
	rows, err := repository.db.Query(ctx, "SELECT id, type, original_file_name, mime_type, size, storage_key, visibility, processing_status, variants FROM assets WHERE id = $1", id)
	if err != nil {
		return models.Asset{}, err
	}
	defer rows.Close()

	assets, err := repository.scanAssets(rows)
	if err != nil {
		return models.Asset{}, err
	}

	if len(assets) == 0 {
		return models.Asset{}, pgx.ErrNoRows
	}

	return assets[0], nil
}

func (repository *Repository) CreateAsset(ctx context.Context, asset models.Asset) (models.Asset, error) {
	if asset.ID == "" {
		asset.ID = ids.New()
	}

	variants, err := json.Marshal(asset.Variants)
	if err != nil {
		return models.Asset{}, err
	}

	_, err = repository.db.Exec(
		ctx,
		`INSERT INTO assets (id, type, original_file_name, mime_type, size, storage_key, visibility, processing_status, variants)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		asset.ID,
		asset.Type,
		asset.OriginalFileName,
		asset.MimeType,
		asset.Size,
		asset.StorageKey,
		asset.Visibility,
		asset.ProcessingStatus,
		variants,
	)
	if err != nil {
		return models.Asset{}, err
	}

	return repository.Asset(ctx, asset.ID)
}

func (repository *Repository) UpdateAssetProcessing(ctx context.Context, id string, status string, variants []models.AssetVariant) (models.Asset, error) {
	payload, err := json.Marshal(variants)
	if err != nil {
		return models.Asset{}, err
	}

	_, err = repository.db.Exec(ctx, "UPDATE assets SET processing_status = $2, variants = $3, updated_at = now() WHERE id = $1", id, status, payload)
	if err != nil {
		return models.Asset{}, err
	}

	return repository.Asset(ctx, id)
}

func (repository *Repository) DeleteAsset(ctx context.Context, id string) (models.Asset, error) {
	asset, err := repository.Asset(ctx, id)
	if err != nil {
		return models.Asset{}, err
	}

	_, err = repository.db.Exec(ctx, "DELETE FROM assets WHERE id = $1", id)
	return asset, err
}

func (repository *Repository) artworkByClause(ctx context.Context, clause string, args []any, locale models.Locale) (models.Artwork, error) {
	rows, err := repository.db.Query(
		ctx,
		"SELECT id, slug, year, title_ru, title_en, description_ru, description_en, tags, status, sort_order, cover_asset_id FROM artworks WHERE "+clause,
		args...,
	)
	if err != nil {
		return models.Artwork{}, err
	}
	defer rows.Close()

	artworks, err := repository.scanArtworkRows(ctx, rows, locale)
	if err != nil {
		return models.Artwork{}, err
	}

	if len(artworks) == 0 {
		return models.Artwork{}, pgx.ErrNoRows
	}

	return artworks[0], nil
}

func (repository *Repository) scanArtworkRows(ctx context.Context, rows pgx.Rows, locale models.Locale) ([]models.Artwork, error) {
	artworks := make([]models.Artwork, 0)
	for rows.Next() {
		var artwork models.Artwork
		var titleRU string
		var titleEN string
		var descriptionRU string
		var descriptionEN string
		var coverAssetID *string

		if err := rows.Scan(&artwork.ID, &artwork.Slug, &artwork.Year, &titleRU, &titleEN, &descriptionRU, &descriptionEN, &artwork.Tags, &artwork.Status, &artwork.SortOrder, &coverAssetID); err != nil {
			return nil, err
		}

		if locale == models.LocaleEN {
			artwork.Title = titleEN
			artwork.Description = descriptionEN
		} else {
			artwork.Title = titleRU
			artwork.Description = descriptionRU
		}

		if coverAssetID != nil {
			asset, err := repository.Asset(ctx, *coverAssetID)
			if err == nil {
				artwork.CoverAsset = &asset
			}
		}

		if err := repository.attachAssets(ctx, &artwork); err != nil {
			return nil, err
		}

		artworks = append(artworks, artwork)
	}

	return artworks, rows.Err()
}

func (repository *Repository) attachAssets(ctx context.Context, artwork *models.Artwork) error {
	rows, err := repository.db.Query(
		ctx,
		`SELECT a.id, a.type, a.original_file_name, a.mime_type, a.size, a.storage_key, a.visibility, a.processing_status, a.variants, aa.role
		 FROM artwork_assets aa
		 JOIN assets a ON a.id = aa.asset_id
		 WHERE aa.artwork_id = $1
		 ORDER BY aa.role, aa.sort_order`,
		artwork.ID,
	)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var asset models.Asset
		var variantsJSON []byte
		var role string

		if err := rows.Scan(&asset.ID, &asset.Type, &asset.OriginalFileName, &asset.MimeType, &asset.Size, &asset.StorageKey, &asset.Visibility, &asset.ProcessingStatus, &variantsJSON, &role); err != nil {
			return err
		}

		if err := json.Unmarshal(variantsJSON, &asset.Variants); err != nil {
			return err
		}
		repository.decorateAsset(&asset)

		switch role {
		case "gallery":
			artwork.GalleryAssets = append(artwork.GalleryAssets, asset)
		case "process":
			artwork.ProcessAssets = append(artwork.ProcessAssets, asset)
		case "download":
			artwork.DownloadAssets = append(artwork.DownloadAssets, asset)
		case "video":
			artwork.VideoAssets = append(artwork.VideoAssets, asset)
		}
	}

	if artwork.CoverAsset != nil && len(artwork.GalleryAssets) == 0 {
		artwork.GalleryAssets = append(artwork.GalleryAssets, *artwork.CoverAsset)
	}

	if artwork.CoverAsset != nil && len(artwork.DownloadAssets) == 0 && artwork.CoverAsset.Visibility == "private" {
		artwork.DownloadAssets = append(artwork.DownloadAssets, *artwork.CoverAsset)
	}

	return rows.Err()
}

func (repository *Repository) scanAssets(rows pgx.Rows) ([]models.Asset, error) {
	assets := make([]models.Asset, 0)
	for rows.Next() {
		var asset models.Asset
		var variantsJSON []byte

		if err := rows.Scan(&asset.ID, &asset.Type, &asset.OriginalFileName, &asset.MimeType, &asset.Size, &asset.StorageKey, &asset.Visibility, &asset.ProcessingStatus, &variantsJSON); err != nil {
			return nil, err
		}

		if len(variantsJSON) > 0 {
			if err := json.Unmarshal(variantsJSON, &asset.Variants); err != nil {
				return nil, err
			}
		}

		repository.decorateAsset(&asset)
		assets = append(assets, asset)
	}

	return assets, rows.Err()
}

func (repository *Repository) decorateAsset(asset *models.Asset) {
	if asset.Visibility == "public" {
		asset.URL = repository.publicURL(*asset)
	}

	for index := range asset.Variants {
		if asset.Variants[index].URL == "" {
			asset.Variants[index].URL = repository.publicURL(models.Asset{StorageKey: asset.Variants[index].Name, Visibility: "public"})
		}
	}
}

func (repository *Repository) syncArtworkAssets(ctx context.Context, artworkID string, input models.ArtworkInput) error {
	if _, err := repository.db.Exec(ctx, "DELETE FROM artwork_assets WHERE artwork_id = $1", artworkID); err != nil {
		return err
	}

	roles := map[string][]string{
		"gallery":  input.GalleryAssetIDs,
		"process":  input.ProcessAssetIDs,
		"download": input.DownloadAssetIDs,
		"video":    input.VideoAssetIDs,
	}

	for role, assetIDs := range roles {
		for index, assetID := range assetIDs {
			if _, err := repository.db.Exec(
				ctx,
				"INSERT INTO artwork_assets (artwork_id, asset_id, role, sort_order) VALUES ($1, $2, $3, $4)",
				artworkID,
				assetID,
				role,
				index,
			); err != nil {
				return err
			}
		}
	}

	return nil
}

func NormalizeLocale(value string) models.Locale {
	if value == string(models.LocaleEN) {
		return models.LocaleEN
	}

	return models.LocaleRU
}

func IsNotFound(err error) bool {
	return errors.Is(err, pgx.ErrNoRows)
}
