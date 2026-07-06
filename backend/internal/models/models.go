package models

type Locale string

const (
	LocaleRU Locale = "ru"
	LocaleEN Locale = "en"
)

type Asset struct {
	ID               string         `json:"id"`
	Type             string         `json:"type"`
	OriginalFileName string         `json:"originalFileName"`
	MimeType         string         `json:"mimeType"`
	Size             int64          `json:"size"`
	URL              string         `json:"url"`
	StorageKey       string         `json:"-"`
	Visibility       string         `json:"visibility"`
	ProcessingStatus string         `json:"processingStatus"`
	Variants         []AssetVariant `json:"variants"`
}

type AssetVariant struct {
	Name   string `json:"name"`
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

type Artwork struct {
	ID             string   `json:"id"`
	Slug           string   `json:"slug"`
	Year           int      `json:"year"`
	Title          string   `json:"title"`
	Description    string   `json:"description"`
	Tags           []string `json:"tags"`
	Status         string   `json:"status"`
	SortOrder      int      `json:"sortOrder"`
	CoverAsset     *Asset   `json:"coverAsset"`
	GalleryAssets  []Asset  `json:"galleryAssets"`
	ProcessAssets  []Asset  `json:"processAssets"`
	DownloadAssets []Asset  `json:"downloadAssets"`
	VideoAssets    []Asset  `json:"videoAssets"`
}

type ArtworkInput struct {
	Slug             string   `json:"slug"`
	Year             int      `json:"year"`
	TitleRU          string   `json:"titleRu"`
	TitleEN          string   `json:"titleEn"`
	DescriptionRU    string   `json:"descriptionRu"`
	DescriptionEN    string   `json:"descriptionEn"`
	Tags             []string `json:"tags"`
	Status           string   `json:"status"`
	SortOrder        int      `json:"sortOrder"`
	CoverAssetID     *string  `json:"coverAssetId"`
	GalleryAssetIDs  []string `json:"galleryAssetIds"`
	ProcessAssetIDs  []string `json:"processAssetIds"`
	DownloadAssetIDs []string `json:"downloadAssetIds"`
	VideoAssetIDs    []string `json:"videoAssetIds"`
}
