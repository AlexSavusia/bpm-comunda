import type { ApiProcess, PageResponse, Uuid } from "./types";
import { HttpClient } from "./http";

export type GetProcessesParams = {
    page?: number;
    size?: number;
};

export type PatchProcessBody = Partial<Pick<ApiProcess, "name" | "description" | "active" | "processDefinition">>;

export class ProcessApi {
    private readonly http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    /** GET /admin/v1/process */
    getProcesses(params: GetProcessesParams = {}) {
        return this.http.request<PageResponse<ApiProcess>>("GET", "/api/admin/v1/process", {
            query: {
                page: params.page ?? 20,
                size: params.size ?? 20,
            },
        });
    }

    /**
     * PUT /admin/v1/process
     * Судя по Swagger — принимает FULL Process object (setId, version, createdAt, ...)
     */
    putProcess(process: ApiProcess) {
        return this.http.request<ApiProcess>("PUT", "/api/admin/v1/process", { body: process });
    }

    /** PATCH /admin/v1/process/{id} */
    patchProcess(id: Uuid, body: PatchProcessBody) {
        return this.http.request<ApiProcess>("PATCH", `/api/admin/v1/process/${id}`, { body });
    }

    /** DELETE /admin/v1/process/{id} */
        deleteProcess(id: Uuid) {
        return this.http.request<void>("DELETE", `/api/admin/v1/process/${id}`);
    }

    createProcess(body: PatchProcessBody) {
        return this.http.request<ApiProcess>("PUT", "/api/admin/v1/process", { body });
    }
}