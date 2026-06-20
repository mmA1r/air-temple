export type Locale = "ru" | "en";

export type ThemeName = "water-air" | "fire-earth";

export type ArtworkStatus = "draft" | "published";

export type AssetType = "cover" | "preview" | "high_res_png" | "psd" | "sequence" | "video";

export type AssetVisibility = "public" | "private";

export interface IAssetVariant {
    name: string;
    url: string;
    width: number;
    height: number;
}

export interface IAsset {
    id: string;
    type: AssetType;
    originalFileName: string;
    mimeType: string;
    size: number;
    url: string;
    visibility: AssetVisibility;
    processingStatus: "pending" | "ready" | "failed";
    variants: IAssetVariant[];
}

export interface IArtwork {
    id: string;
    slug: string;
    year: number;
    title: string;
    description: string;
    tags: string[];
    status: ArtworkStatus;
    sortOrder: number;
    coverAsset: IAsset | null;
    galleryAssets: IAsset[];
    processAssets: IAsset[];
    downloadAssets: IAsset[];
    videoAssets: IAsset[];
}

export interface IAdminArtworkPayload {
    slug: string;
    year: number;
    titleRu: string;
    titleEn: string;
    descriptionRu: string;
    descriptionEn: string;
    tags: string[];
    status: ArtworkStatus;
    sortOrder: number;
    coverAssetId: string | null;
    galleryAssetIds: string[];
    processAssetIds: string[];
    downloadAssetIds: string[];
    videoAssetIds: string[];
}
