// src/api/http.ts
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiError = {
    status: number;
    message: string;
    details?: any;
};

const DEFAULT_TIMEOUT_MS = 20_000;

function withTimeout(signal?: AbortSignal, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort);

    return {
        signal: controller.signal,
        cleanup: () => {
            clearTimeout(t);
            signal?.removeEventListener("abort", onAbort);
        },
    };
}

function isAbsoluteHttpUrl(v: string) {
    return /^https?:\/\//i.test(v);
}

function tryParseJson(text: string) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export class HttpClient {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async request<TResponse>(
        method: HttpMethod,
        path: string,
        options?: {
            query?: Record<string, string | number | boolean | undefined | null>;
            body?: unknown;
            headers?: Record<string, string>;
            signal?: AbortSignal;
            timeoutMs?: number;
        }
    ): Promise<TResponse> {
        const base = (this.baseUrl ?? "").trim();
        const finalPath = path.startsWith("/") ? path : `/${path}`;

        const url = isAbsoluteHttpUrl(base)
            ? new URL(finalPath, base)
            : new URL(
                `${base.startsWith("/") ? base : `/${base}`}${finalPath}`,
                window.location.origin
            );

        if (options?.query) {
            for (const [k, v] of Object.entries(options.query)) {
                if (v === undefined || v === null) continue;
                url.searchParams.set(k, String(v));
            }
        }

        const { signal, cleanup } = withTimeout(options?.signal, options?.timeoutMs);

        const hasBody = options?.body !== undefined;

        const headers: Record<string, string> = {
            ...(options?.headers ?? {}),
        };
        if (hasBody) headers["Content-Type"] = "application/json";

        try {
            const res = await fetch(url.toString(), {
                method,
                headers,
                body: hasBody ? JSON.stringify(options!.body) : undefined,
                signal,
            });

            // 204 No Content
            if (res.status === 204) return undefined as TResponse;

            const contentType = res.headers.get("content-type") ?? "";
            const isJson = contentType.includes("application/json");

            let payload: any = null;

            if (isJson) {
                payload = await res.json().catch(() => null);
            } else {
                const text = await res.text().catch(() => "");
                payload = tryParseJson(text) ?? text;
            }

            if (!res.ok) {
                const err: ApiError = {
                    status: res.status,
                    message:
                        (payload &&
                            typeof payload === "object" &&
                            "message" in payload &&
                            String((payload as any).message)) ||
                        res.statusText ||
                        "Request failed",
                    details: payload,
                };
                throw err;
            }

            return payload as TResponse;
        } finally {
            cleanup();
        }
    }
}