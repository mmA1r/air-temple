"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { apiClient } from "@api/apiClient";
import { useAppContext } from "@context/AppContext";
import type { IArtwork } from "@app-types";

import "./GalleryPage.scss";

function GalleryPage() {
    const { copy, locale } = useAppContext();
    const [artworks, setArtworks] = useState<IArtwork[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        setIsLoading(true);
        apiClient
            .getArtworks(locale)
            .then((items) => {
                if (isActive) {
                    setArtworks(items);
                    setError(null);
                }
            })
            .catch((requestError: Error) => {
                if (isActive) {
                    setError(requestError.message);
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

    const groupedArtworks = useMemo(() => {
        return artworks.reduce<Record<number, IArtwork[]>>((groups, artwork) => {
            groups[artwork.year] = groups[artwork.year] || [];
            groups[artwork.year].push(artwork);

            return groups;
        }, {});
    }, [artworks]);

    const years = Object.keys(groupedArtworks)
        .map(Number)
        .sort((leftYear, rightYear) => rightYear - leftYear);

    return (
        <section className="gallery-page">
            <header className="gallery-page__header">
                <p className="gallery-page__eyebrow">Piece of art</p>
                <h1 className="gallery-page__title">{copy.featuredWorks}</h1>
                <p className="gallery-page__intro">An archive arranged by year. Every image opens its process and source files.</p>
            </header>
            {isLoading && <p className="gallery-page__state">Loading...</p>}
            {error && <p className="gallery-page__state">{error}</p>}
            {!isLoading && !error && years.length === 0 && <p className="gallery-page__state">No artworks yet.</p>}
            <div className="gallery-page__years">
                {years.map((year) => (
                    <section className="gallery-page__year" key={year}>
                        <h2 className="gallery-page__year-title">{year}</h2>
                        <div className="gallery-page__grid">
                            {groupedArtworks[year].map((artwork, index) => (
                                <Link
                                    className={`gallery-page__card gallery-page__card--${(index % 3) + 1}`}
                                    key={artwork.id}
                                    href={`/artworks/${artwork.slug}`}
                                >
                                    <span className="gallery-page__image-wrap">
                                        {artwork.coverAsset ? (
                                            <img
                                                className="gallery-page__image"
                                                src={artwork.coverAsset.url}
                                                alt={artwork.title}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <span className="gallery-page__placeholder" />
                                        )}
                                    </span>
                                    <span className="gallery-page__card-title">{artwork.title}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </section>
    );
}

export default GalleryPage;
