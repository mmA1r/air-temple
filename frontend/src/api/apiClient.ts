import type { IAdminArtworkPayload, IArtwork, IAsset, Locale } from "@app-types";
import { mockApiClient } from "./mockApiClient";

interface IDownloadResponse {
    url: string;
}

interface ILoginResponse {
    token: string;
}

class ApiClient {
    private readonly baseUrl: string;
    private token: string | null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.token = typeof window === "undefined" ? null : window.localStorage.getItem("air-temple-admin-token");
    }

    async getYears(): Promise<number[]> {
        return this.request<number[]>("/api/years");
    }

    async getArtworks(locale: Locale, year?: number): Promise<IArtwork[]> {
        const params = new URLSearchParams({ locale });

        if (year) {
            params.set("year", String(year));
        }

        return this.request<IArtwork[]>(`/api/artworks?${params.toString()}`);
    }

    async getArtwork(slug: string, locale: Locale): Promise<IArtwork> {
        return this.request<IArtwork>(`/api/artworks/${slug}?locale=${locale}`);
    }

    async createDownloadUrl(assetId: string): Promise<string> {
        const result = await this.request<IDownloadResponse>(`/api/downloads/${assetId}`, {
            method: "POST",
        });

        return result.url;
    }

    async login(username: string, password: string): Promise<void> {
        const result = await this.request<ILoginResponse>("/api/admin/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });

        this.token = result.token;

        if (typeof window !== "undefined") {
            window.localStorage.setItem("air-temple-admin-token", result.token);
        }
    }

    async logout(): Promise<void> {
        await this.request<void>("/api/admin/logout", { method: "POST" });
        this.token = null;

        if (typeof window !== "undefined") {
            window.localStorage.removeItem("air-temple-admin-token");
        }
    }

    async getAdminArtworks(): Promise<IArtwork[]> {
        return this.request<IArtwork[]>("/api/admin/artworks");
    }

    async createArtwork(payload: IAdminArtworkPayload): Promise<IArtwork> {
        return this.request<IArtwork>("/api/admin/artworks", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    async updateArtwork(id: string, payload: IAdminArtworkPayload): Promise<IArtwork> {
        return this.request<IArtwork>(`/api/admin/artworks/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        });
    }

    async deleteArtwork(id: string): Promise<void> {
        return this.request<void>(`/api/admin/artworks/${id}`, { method: "DELETE" });
    }

    async getAssets(): Promise<IAsset[]> {
        return this.request<IAsset[]>("/api/admin/assets");
    }

    async uploadAsset(file: File, type: string, visibility: string): Promise<IAsset> {
        const data = new FormData();
        data.set("file", file);
        data.set("type", type);
        data.set("visibility", visibility);

        return this.request<IAsset>("/api/admin/assets", {
            method: "POST",
            body: data,
            skipJsonHeader: true,
        });
    }

    async deleteAsset(id: string): Promise<void> {
        return this.request<void>(`/api/admin/assets/${id}`, { method: "DELETE" });
    }

    async regenerateAsset(id: string): Promise<IAsset> {
        return this.request<IAsset>(`/api/admin/assets/${id}/regenerate`, { method: "POST" });
    }

    private async request<T>(path: string, init: RequestInit & { skipJsonHeader?: boolean } = {}): Promise<T> {
        const headers = new Headers(init.headers);

        if (!init.skipJsonHeader) {
            headers.set("Content-Type", "application/json");
        }

        if (this.token) {
            headers.set("Authorization", `Bearer ${this.token}`);
        }

        const response = await fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers,
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `Request failed with ${response.status}`);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return response.json() as Promise<T>;
    }
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const apiMode = process.env.NEXT_PUBLIC_API_MODE || "mock";

export const apiClient = apiMode === "api" ? new ApiClient(apiUrl) : mockApiClient;
