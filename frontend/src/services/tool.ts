import type { i_tool } from "@/types";
import { http } from "./base";
import type { i_success_response } from "@/types/base";

export const get_list_tools_service = async (): Promise<i_success_response<i_tool[]>> =>{
    try {
        const url = "/tools";
        return await http.get(url);
    } catch (error) {
        throw error;
    }
}
