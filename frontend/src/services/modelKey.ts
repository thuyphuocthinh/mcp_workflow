import { http } from "./base";
import type { i_upsert_key_request, i_key_response } from '@/types/modelKey';
import type {  i_success_response } from "@/types/base";
import type { i_model } from "@/constants";

export const upsert_key_service = async (data: i_upsert_key_request): Promise<i_success_response<i_key_response>> =>{
    try {
        const url = "/model-keys";
        return await http.put(url, data);
    } catch (error) {
        throw error;
    }
}

export const get_all_key_service = async (): Promise<i_success_response<i_key_response[]>> =>{
    try {
        const url = "/model-keys";
        return await http.get(url);
    } catch (error) {
        throw error;
    }
}

export const delete_key_service = async (type: i_model): Promise<i_success_response<string>> =>{
    try {
        const url = `/model-keys/${type}`;
        return await http.delete(url);
    } catch (error) {
        throw error;
    }
}