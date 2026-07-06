CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    original_file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    storage_key TEXT NOT NULL UNIQUE,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
    processing_status TEXT NOT NULL CHECK (
        processing_status IN ('pending', 'ready', 'failed')
    ),
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS artworks (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ru TEXT NOT NULL,
    description_en TEXT NOT NULL,
    tags TEXT [] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    cover_asset_id TEXT REFERENCES assets(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS artwork_assets (
    artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (artwork_id, asset_id, role)
);
CREATE INDEX IF NOT EXISTS artworks_public_idx ON artworks (status, year DESC, sort_order ASC);
CREATE INDEX IF NOT EXISTS artwork_assets_artwork_idx ON artwork_assets (artwork_id, role, sort_order);
