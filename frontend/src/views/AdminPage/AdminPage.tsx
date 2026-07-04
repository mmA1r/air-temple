"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiClient } from "@api/apiClient";
import { useAppContext } from "@context/AppContext";
import type { IAdminArtworkPayload, IArtwork, IAsset, ArtworkStatus, AssetVisibility } from "@app-types";

import "./AdminPage.scss";

const emptyArtwork: IAdminArtworkPayload = {
    slug: "",
    year: new Date().getFullYear(),
    titleRu: "",
    titleEn: "",
    descriptionRu: "",
    descriptionEn: "",
    tags: [],
    status: "draft",
    sortOrder: 0,
    coverAssetId: null,
    galleryAssetIds: [],
    processAssetIds: [],
    downloadAssetIds: [],
    videoAssetIds: [],
};

function AdminPage() {
    const { copy } = useAppContext();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [artworks, setArtworks] = useState<IArtwork[]>([]);
    const [assets, setAssets] = useState<IAsset[]>([]);
    const [form, setForm] = useState<IAdminArtworkPayload>(emptyArtwork);
    const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
    const [uploadType, setUploadType] = useState("preview");
    const [uploadVisibility, setUploadVisibility] = useState<AssetVisibility>("public");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsAuthenticated(Boolean(window.localStorage.getItem("air-temple-admin-token")));
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            refreshAdminData();
        }
    }, [isAuthenticated]);

    async function refreshAdminData() {
        const [nextArtworks, nextAssets] = await Promise.all([apiClient.getAdminArtworks(), apiClient.getAssets()]);
        setArtworks(nextArtworks);
        setAssets(nextAssets);
    }

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            await apiClient.login(username, password);
            setIsAuthenticated(true);
            setError(null);
        } catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : "Login failed");
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            if (selectedArtworkId) {
                await apiClient.updateArtwork(selectedArtworkId, form);
            } else {
                await apiClient.createArtwork(form);
            }

            setForm(emptyArtwork);
            setSelectedArtworkId(null);
            await refreshAdminData();
            setError(null);
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "Save failed");
        }
    }

    async function handleUpload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const file = data.get("file");

        if (!(file instanceof File) || file.size === 0) {
            return;
        }

        await apiClient.uploadAsset(file, uploadType, uploadVisibility);
        event.currentTarget.reset();
        await refreshAdminData();
    }

    function editArtwork(artwork: IArtwork) {
        setSelectedArtworkId(artwork.id);
        setForm({
            slug: artwork.slug,
            year: artwork.year,
            titleRu: artwork.title,
            titleEn: artwork.title,
            descriptionRu: artwork.description,
            descriptionEn: artwork.description,
            tags: artwork.tags,
            status: artwork.status,
            sortOrder: artwork.sortOrder,
            coverAssetId: artwork.coverAsset?.id || null,
            galleryAssetIds: artwork.galleryAssets.map((asset) => asset.id),
            processAssetIds: artwork.processAssets.map((asset) => asset.id),
            downloadAssetIds: artwork.downloadAssets.map((asset) => asset.id),
            videoAssetIds: artwork.videoAssets.map((asset) => asset.id),
        });
    }

    function readSelectedOptions(options: HTMLCollectionOf<HTMLOptionElement>) {
        return Array.from(options)
            .filter((option) => option.selected)
            .map((option) => option.value);
    }

    if (!isAuthenticated) {
        return (
            <section className="admin-page">
                <form className="admin-page__login" onSubmit={handleLogin}>
                    <h1 className="admin-page__title">{copy.login}</h1>
                    {error && <p className="admin-page__error">{error}</p>}
                    <label className="admin-page__field">
                        <span>{copy.username}</span>
                        <input value={username} onChange={(event) => setUsername(event.target.value)} />
                    </label>
                    <label className="admin-page__field">
                        <span>{copy.password}</span>
                        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                    </label>
                    <button className="admin-page__button" type="submit">
                        {copy.login}
                    </button>
                </form>
            </section>
        );
    }

    return (
        <section className="admin-page">
            <div className="admin-page__layout">
                <form className="admin-page__panel" onSubmit={handleSubmit}>
                    <h1 className="admin-page__title">{copy.artworks}</h1>
                    {error && <p className="admin-page__error">{error}</p>}
                    <label className="admin-page__field">
                        <span>Slug</span>
                        <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
                    </label>
                    <label className="admin-page__field">
                        <span>Year</span>
                        <input
                            type="number"
                            value={form.year}
                            onChange={(event) => setForm({ ...form, year: Number(event.target.value) })}
                        />
                    </label>
                    <label className="admin-page__field">
                        <span>Title RU</span>
                        <input value={form.titleRu} onChange={(event) => setForm({ ...form, titleRu: event.target.value })} />
                    </label>
                    <label className="admin-page__field">
                        <span>Title EN</span>
                        <input value={form.titleEn} onChange={(event) => setForm({ ...form, titleEn: event.target.value })} />
                    </label>
                    <label className="admin-page__field">
                        <span>Description RU</span>
                        <textarea value={form.descriptionRu} onChange={(event) => setForm({ ...form, descriptionRu: event.target.value })} />
                    </label>
                    <label className="admin-page__field">
                        <span>Description EN</span>
                        <textarea value={form.descriptionEn} onChange={(event) => setForm({ ...form, descriptionEn: event.target.value })} />
                    </label>
                    <label className="admin-page__field">
                        <span>Status</span>
                        <select
                            value={form.status}
                            onChange={(event) => setForm({ ...form, status: event.target.value as ArtworkStatus })}
                        >
                            <option value="draft">{copy.draft}</option>
                            <option value="published">{copy.published}</option>
                        </select>
                    </label>
                    <label className="admin-page__field">
                        <span>Cover</span>
                        <select
                            value={form.coverAssetId || ""}
                            onChange={(event) => setForm({ ...form, coverAssetId: event.target.value || null })}
                        >
                            <option value="">None</option>
                            {assets.map((asset) => (
                                <option value={asset.id} key={asset.id}>
                                    {asset.originalFileName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="admin-page__field">
                        <span>Gallery assets</span>
                        <select
                            multiple
                            value={form.galleryAssetIds}
                            onChange={(event) => setForm({ ...form, galleryAssetIds: readSelectedOptions(event.currentTarget.options) })}
                        >
                            {assets.map((asset) => (
                                <option value={asset.id} key={asset.id}>
                                    {asset.originalFileName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="admin-page__field">
                        <span>Process sequence</span>
                        <select
                            multiple
                            value={form.processAssetIds}
                            onChange={(event) => setForm({ ...form, processAssetIds: readSelectedOptions(event.currentTarget.options) })}
                        >
                            {assets.map((asset) => (
                                <option value={asset.id} key={asset.id}>
                                    {asset.originalFileName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="admin-page__field">
                        <span>Download assets</span>
                        <select
                            multiple
                            value={form.downloadAssetIds}
                            onChange={(event) => setForm({ ...form, downloadAssetIds: readSelectedOptions(event.currentTarget.options) })}
                        >
                            {assets.map((asset) => (
                                <option value={asset.id} key={asset.id}>
                                    {asset.originalFileName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="admin-page__field">
                        <span>Video assets</span>
                        <select
                            multiple
                            value={form.videoAssetIds}
                            onChange={(event) => setForm({ ...form, videoAssetIds: readSelectedOptions(event.currentTarget.options) })}
                        >
                            {assets.map((asset) => (
                                <option value={asset.id} key={asset.id}>
                                    {asset.originalFileName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button className="admin-page__button" type="submit">
                        {copy.save}
                    </button>
                </form>
                <div className="admin-page__panel">
                    <h2 className="admin-page__subtitle">{copy.assets}</h2>
                    <form className="admin-page__upload" onSubmit={handleUpload}>
                        <input name="file" type="file" />
                        <select value={uploadType} onChange={(event) => setUploadType(event.target.value)}>
                            <option value="preview">Preview</option>
                            <option value="high_res_png">High-res PNG</option>
                            <option value="psd">PSD</option>
                            <option value="sequence">Sequence</option>
                            <option value="video">Video</option>
                        </select>
                        <select
                            value={uploadVisibility}
                            onChange={(event) => setUploadVisibility(event.target.value as AssetVisibility)}
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <button className="admin-page__button" type="submit">
                            {copy.upload}
                        </button>
                    </form>
                    <div className="admin-page__list">
                        {assets.map((asset) => (
                            <div className="admin-page__list-item" key={asset.id}>
                                <span>{asset.originalFileName}</span>
                                <button type="button" onClick={() => apiClient.regenerateAsset(asset.id).then(refreshAdminData)}>
                                    Regenerate
                                </button>
                            </div>
                        ))}
                    </div>
                    <h2 className="admin-page__subtitle">{copy.artworks}</h2>
                    <div className="admin-page__list">
                        {artworks.map((artwork) => (
                            <button className="admin-page__list-item" type="button" key={artwork.id} onClick={() => editArtwork(artwork)}>
                                <span>{artwork.title}</span>
                                <span>{artwork.status}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AdminPage;
