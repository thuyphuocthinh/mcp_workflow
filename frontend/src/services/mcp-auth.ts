import { http } from "./base";
import type { i_success_response } from "@/types/base";

export const tool_auth_service = async (): Promise<i_success_response<void[]>> => {
    try {
        const url = "/tool-auth/google";
        return await http.get(url);
    } catch (error) {
        throw error;
    }
}


export const tool_revoke_service = async (toolKey: string): Promise<i_success_response<string>> => {
    try {
        const url = `/tool-auth/revoke/${toolKey}`;
        return await http.post(url);
    } catch (error) {
        throw error;
    }
}