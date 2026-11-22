CREATE TABLE artwork_media (
    artwork_id uuid NOT NULL REFERENCES artworks(id),
    kind text NOT NULL CHECK (kind IN ('psd','video','step')),
    position integer NOT NULL CHECK (
        (kind = 'step' AND position > 0) OR (kind <> 'step' AND position = 0)
    ),
    file_id uuid NOT NULL UNIQUE,
    PRIMARY KEY (artwork_id, kind, position) DEFERRABLE INITIALLY IMMEDIATE
);
