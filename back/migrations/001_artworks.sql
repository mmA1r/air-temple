CREATE TABLE artworks (
    id uuid PRIMARY KEY,
    title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    ready boolean NOT NULL DEFAULT false,
    published boolean NOT NULL DEFAULT false CHECK (NOT published OR ready),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX artworks_gallery ON artworks (created_at DESC, id DESC) WHERE published;
