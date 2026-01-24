import type { i_user } from "@/types";
import { http } from "./base";
import type { i_success_response } from "@/types/base";

export const get_profile_service = async (): Promise<i_success_response<i_user>> =>{
    try {
        const url = "/users/me";
        return await http.get(url);
    } catch (error) {
        throw error;
    }
}
