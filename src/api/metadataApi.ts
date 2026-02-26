import type { HttpClient } from "./http";
import type { MetadataResponse } from "./metadataTypes";

export class MetadataApi {
    private readonly http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    getMetadata() {
        return this.http.request<MetadataResponse>("GET", "/admin/v1/metadata");
    }
}