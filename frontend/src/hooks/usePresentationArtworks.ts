"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@api/apiClient";
import type { IArtwork, Locale } from "@app-types";

interface IUsePresentationArtworksResult {
    artworks: IArtwork[];
    hasError: boolean;
    isLoading: boolean;
}

function usePresentationArtworks(locale: Locale): IUsePresentationArtworksResult {
    const [artworks, setArtworks] = useState<IArtwork[]>([]);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        setIsLoading(true);
        setHasError(false);

        apiClient
            .getArtworks(locale)
            .then((items) => {
                if (!isActive) {
                    return;
                }

                const presentationArtworks = items
                    .filter((artwork) => artwork.status === "published" && artwork.coverAsset?.processingStatus === "ready")
                    .filter((artwork) => Boolean(artwork.coverAsset?.url || artwork.coverAsset?.variants.some((variant) => variant.url)))
                    .sort(
                        (leftArtwork, rightArtwork) =>
                            rightArtwork.year - leftArtwork.year || leftArtwork.sortOrder - rightArtwork.sortOrder,
                    )
                    .slice(0, 7);

                setArtworks(presentationArtworks);
            })
            .catch(() => {
                if (isActive) {
                    setArtworks([]);
                    setHasError(true);
                }
            })
            .finally(() => {
                if (isActive) {
                    setIsLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, [locale]);

    return { artworks, hasError, isLoading };
}

export default usePresentationArtworks;
