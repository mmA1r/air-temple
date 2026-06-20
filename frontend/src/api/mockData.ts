import type { IArtwork, IAsset } from "../types";

function createArtworkImage(title: string, palette: [string, string, string]) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500">
            <defs>
                <linearGradient id="background" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="${palette[0]}"/>
                    <stop offset="58%" stop-color="${palette[1]}"/>
                    <stop offset="100%" stop-color="${palette[2]}"/>
                </linearGradient>
                <radialGradient id="glow" cx="66%" cy="32%" r="48%">
                    <stop offset="0%" stop-color="rgba(255,255,255,0.88)"/>
                    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
                </radialGradient>
            </defs>
            <rect width="1200" height="1500" fill="url(#background)"/>
            <circle cx="790" cy="420" r="420" fill="url(#glow)"/>
            <path d="M130 1040 C330 770 500 1280 710 890 C850 630 1010 820 1090 620" fill="none" stroke="rgba(255,255,255,0.74)" stroke-width="48" stroke-linecap="round"/>
            <path d="M240 1130 C450 960 610 1160 820 980 C960 860 1010 910 1080 850" fill="none" stroke="rgba(20,30,40,0.22)" stroke-width="22" stroke-linecap="round"/>
            <text x="96" y="1348" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="72" font-weight="700">${title}</text>
        </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createAsset(id: string, title: string, type: IAsset["type"], visibility: IAsset["visibility"], palette: [string, string, string]): IAsset {
    const url = createArtworkImage(title, palette);

    return {
        id,
        type,
        originalFileName: `${title.toLowerCase().replaceAll(" ", "-")}.${type === "psd" ? "psd" : "png"}`,
        mimeType: type === "psd" ? "application/octet-stream" : "image/svg+xml",
        size: 2400000,
        url: visibility === "public" ? url : "",
        visibility,
        processingStatus: "ready",
        variants: [
            {
                name: `${id}-web`,
                url,
                width: 1200,
                height: 1500,
            },
        ],
    };
}

const dawnCover = createAsset("asset-dawn-cover", "Dawn Current", "cover", "public", ["#89d7ed", "#f7fbff", "#6ca8cf"]);
const dawnProcessA = createAsset("asset-dawn-process-a", "Dawn Sketch", "preview", "public", ["#dff4fb", "#90cce2", "#315f86"]);
const dawnProcessB = createAsset("asset-dawn-process-b", "Dawn Color", "preview", "public", ["#9dd5e6", "#f6f9f2", "#2c87a7"]);
const dawnPsd = createAsset("asset-dawn-psd", "Dawn Source", "psd", "private", ["#9dd5e6", "#f6f9f2", "#2c87a7"]);

const emberCover = createAsset("asset-ember-cover", "Ember Gate", "cover", "public", ["#332018", "#d46c34", "#f3c27a"]);
const emberProcessA = createAsset("asset-ember-process-a", "Ember Sketch", "preview", "public", ["#5a3125", "#e58c45", "#201311"]);
const emberPsd = createAsset("asset-ember-psd", "Ember Source", "psd", "private", ["#5a3125", "#e58c45", "#201311"]);

const archiveCover = createAsset("asset-archive-cover", "Cloud Archive", "cover", "public", ["#c8ecf7", "#fcfdff", "#8d99c7"]);
const archiveSequence = createAsset("asset-archive-sequence", "Cloud Sequence", "sequence", "private", ["#c8ecf7", "#fcfdff", "#8d99c7"]);

export const mockAssets: IAsset[] = [
    dawnCover,
    dawnProcessA,
    dawnProcessB,
    dawnPsd,
    emberCover,
    emberProcessA,
    emberPsd,
    archiveCover,
    archiveSequence,
];

export const mockArtworks: IArtwork[] = [
    {
        id: "artwork-dawn-current",
        slug: "dawn-current",
        year: 2026,
        title: "Dawn Current",
        description: "A light water-air study with soft motion, transparent layers, and high-resolution source files.",
        tags: ["water", "air", "digital"],
        status: "published",
        sortOrder: 1,
        coverAsset: dawnCover,
        galleryAssets: [dawnCover],
        processAssets: [dawnProcessA, dawnProcessB],
        downloadAssets: [dawnPsd],
        videoAssets: [],
    },
    {
        id: "artwork-ember-gate",
        slug: "ember-gate",
        year: 2026,
        title: "Ember Gate",
        description: "A darker fire-earth composition for checking the alternate theme and artwork detail layout.",
        tags: ["fire", "earth", "portal"],
        status: "published",
        sortOrder: 2,
        coverAsset: emberCover,
        galleryAssets: [emberCover],
        processAssets: [emberProcessA],
        downloadAssets: [emberPsd],
        videoAssets: [],
    },
    {
        id: "artwork-cloud-archive",
        slug: "cloud-archive",
        year: 2025,
        title: "Cloud Archive",
        description: "A mock older work with a private JPEG sequence archive to test grouped years and download links.",
        tags: ["archive", "sequence"],
        status: "published",
        sortOrder: 1,
        coverAsset: archiveCover,
        galleryAssets: [archiveCover],
        processAssets: [],
        downloadAssets: [archiveSequence],
        videoAssets: [],
    },
];
