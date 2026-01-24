import type { i_model } from "@/constants";

export interface i_upsert_key_request {
    key: string;
    modelType: i_model;
}

export interface i_key_response {
    id: string;
    key: string;
    modelType: i_model;
}