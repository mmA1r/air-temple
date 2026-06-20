import type { IAdminArtworkPayload, IArtwork, IAsset, Locale } from "../types";
import { mockArtworks, mockAssets } from "./mockData";

class MockApiClient {
    private artworks: IArtwork[];
    private assets: IAsset[];

    constructor() {
        this.artworks = [...mockArtworks];
        this.assets = [...mockAssets];
    }

    async getYears(): Promise<number[]> {
        return [...new Set(this.artworks.filter((artwork) => artwork.status === "published").map((artwork) => artwork.year))].sort(
            (leftYear, rightYear) => rightYear - leftYear,
        );
    }

    async getArtworks(_locale: Locale, year?: number): Promise<IArtwork[]> {
        return this.artworks
            .filter((artwork) => artwork.status === "published")
            .filter((artwork) => !year || artwork.year === year)
            .sort((leftArtwork, rightArtwork) => rightArtwork.year - leftArtwork.year || leftArtwork.sortOrder - rightArtwork.sortOrder);
    }

    async getArtwork(slug: string, _locale: Locale): Promise<IArtwork> {
        const artwork = this.artworks.find((item) => item.slug === slug && item.status === "published");

        if (!artwork) {
            throw new Error("Artwork not found");
        }

        return artwork;
    }

    async createDownloadUrl(assetId: string): Promise<string> {
        const asset = this.assets.find((item) => item.id === assetId);

        if (!asset) {
            throw new Error("Asset not found");
        }

        if (asset.url) {
            return asset.url;
        }

        return `data:text/plain;charset=utf-8,${encodeURIComponent(`Mock download for ${asset.originalFileName}`)}`;
    }

    async login(username: string, password: string): Promise<void> {
        if (!username || !password) {
            throw new Error("Enter any username and password for mock mode.");
        }

        window.localStorage.setItem("air-temple-admin-token", "mock-admin-token");
    }

    async logout(): Promise<void> {
        window.localStorage.removeItem("air-temple-admin-token");
    }

    async getAdminArtworks(): Promise<IArtwork[]> {
        return [...this.artworks].sort(
            (leftArtwork, rightArtwork) => rightArtwork.year - leftArtwork.year || leftArtwork.sortOrder - rightArtwork.sortOrder,
        );
    }

    async createArtwork(payload: IAdminArtworkPayload): Promise<IArtwork> {
        const artwork = this.createArtworkFromPayload(`mock-artwork-${Date.now()}`, payload);
        this.artworks = [artwork, ...this.artworks];

        return artwork;
    }

    async updateArtwork(id: string, payload: IAdminArtworkPayload): Promise<IArtwork> {
        const artwork = this.createArtworkFromPayload(id, payload);
        this.artworks = this.artworks.map((item) => (item.id === id ? artwork : item));

        return artwork;
    }

    async deleteArtwork(id: string): Promise<void> {
        this.artworks = this.artworks.filter((artwork) => artwork.id !== id);
    }

    async getAssets(): Promise<IAsset[]> {
        return [...this.assets];
    }

    async uploadAsset(file: File, type: string, visibility: string): Promise<IAsset> {
        const isPublic = visibility !== "private";
        const url = URL.createObjectURL(file);
        const asset: IAsset = {
            id: `mock-asset-${Date.now()}`,
            type: this.normalizeAssetType(type),
            originalFileName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            url: isPublic ? url : "",
            visibility: isPublic ? "public" : "private",
            processingStatus: "ready",
            variants: isPublic
                ? [
                      {
                          name: `${file.name}-web`,
                          url,
                          width: 1200,
                          height: 1500,
                      },
                  ]
                : [],
        };

        this.assets = [asset, ...this.assets];

        return asset;
    }

    async deleteAsset(id: string): Promise<void> {
        this.assets = this.assets.filter((asset) => asset.id !== id);
    }

    async regenerateAsset(id: string): Promise<IAsset> {
        const asset = this.assets.find((item) => item.id === id);

        if (!asset) {
            throw new Error("Asset not found");
        }

        asset.processingStatus = "ready";

        return asset;
    }

    private createArtworkFromPayload(id: string, payload: IAdminArtworkPayload): IArtwork {
        const coverAsset = this.assets.find((asset) => asset.id === payload.coverAssetId) || null;

        return {
            id,
            slug: payload.slug,
            year: payload.year,
            title: payload.titleRu || payload.titleEn || payload.slug,
            description: payload.descriptionRu || payload.descriptionEn,
            tags: payload.tags,
            status: payload.status,
            sortOrder: payload.sortOrder,
            coverAsset,
            galleryAssets: this.pickAssets(payload.galleryAssetIds),
            processAssets: this.pickAssets(payload.processAssetIds),
            downloadAssets: this.pickAssets(payload.downloadAssetIds),
            videoAssets: this.pickAssets(payload.videoAssetIds),
        };
    }

    private pickAssets(ids: string[]) {
        return ids
            .map((id) => this.assets.find((asset) => asset.id === id))
            .filter((asset): asset is IAsset => Boolean(asset));
    }

    private normalizeAssetType(type: string): IAsset["type"] {
        if (type === "cover" || type === "preview" || type === "high_res_png" || type === "psd" || type === "sequence" || type === "video") {
            return type;
        }

        return "preview";
    }
}

export const mockApiClient = new MockApiClient();
