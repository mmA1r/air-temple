"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { apiClient } from "../../api/apiClient";
import { useAppContext } from "../../context/AppContext";
import type { IArtwork } from "../../types";

import "./ArtworkPage.scss";

function ArtworkPage() {
    const params = useParams();
    const slugParam = params?.slug;
    const slug = typeof slugParam === "string" ? slugParam : "";
    const { copy, locale } = useAppContext();
    const [artwork, setArtwork] = useState<IArtwork | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        setIsLoading(true);
        apiClient
            .getArtwork(slug, locale)
            .then((item) => {
                if (isActive) {
                    setArtwork(item);
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
    }, [locale, slug]);

    async function handleDownload(assetId: string) {
        const url = await apiClient.createDownloadUrl(assetId);
        window.location.href = url;
    }

    if (isLoading) {
        return <p className="artwork-page__state">Loading...</p>;
    }

    if (error || !artwork) {
        return <p className="artwork-page__state">{error || "Artwork not found."}</p>;
    }

    const mainAsset = artwork.galleryAssets[0] || artwork.coverAsset;

    return (
        <article className="artwork-page">
            <header className="artwork-page__header">
                <p className="artwork-page__year">{artwork.year}</p>
                <h1 className="artwork-page__title">{artwork.title}</h1>
                <p className="artwork-page__description">{artwork.description}</p>
            </header>
            <div className="artwork-page__main">
                {mainAsset ? (
                    <img className="artwork-page__image" src={mainAsset.url} alt={artwork.title} />
                ) : (
                    <div className="artwork-page__image artwork-page__image--empty" />
                )}
            </div>
            <section className="artwork-page__section">
                <h2 className="artwork-page__section-title">{copy.process}</h2>
                <div className="artwork-page__process">
                    {artwork.processAssets.map((asset) => (
                        <img
                            className="artwork-page__process-image"
                            src={asset.url}
                            alt={asset.originalFileName}
                            loading="lazy"
                            decoding="async"
                            key={asset.id}
                        />
                    ))}
                </div>
            </section>
            <section className="artwork-page__section">
                <h2 className="artwork-page__section-title">{copy.downloads}</h2>
                <div className="artwork-page__downloads">
                    {artwork.downloadAssets.map((asset) => (
                        <button className="artwork-page__download" type="button" key={asset.id} onClick={() => handleDownload(asset.id)}>
                            {asset.originalFileName}
                        </button>
                    ))}
                </div>
            </section>
            <section className="artwork-page__video">
                <span>{copy.futureVideo}</span>
            </section>
        </article>
    );
}

export default ArtworkPage;
