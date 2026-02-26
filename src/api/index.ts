import { HttpClient } from "./http";
import { ProcessApi } from "./processApi";
import { MetadataApi } from "./metadataApi";


const baseUrl = import.meta.env.DEV ? "/api" : "https://wmunda.dev.dg-prod.su";
export const http = new HttpClient(baseUrl);
export const processApi = new ProcessApi(http);
export const metadataApi = new MetadataApi(http);