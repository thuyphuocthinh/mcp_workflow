import { http } from "./base";
import type { i_login_request, i_login_response, i_register_request } from "@/types";
import type { i_success_response } from "@/types/base";

export const regiser_service = async (data: i_register_request): Promise<i_success_response<string>> =>{
    try {
        const url = "/auth/register";
        return await http.post(url, data);
    } catch (error) {
        throw error;
    }
}

export const login_service = async (data: i_login_request): Promise<i_success_response<i_login_response>> =>{
    try {
        const url = "/auth/login";
        return await http.post(url, data);
    } catch (error) {
        throw error;
    }
}
