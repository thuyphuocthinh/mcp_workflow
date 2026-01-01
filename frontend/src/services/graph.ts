import { http } from "./base";
import type { i_graph, i_graph_create, i_graph_update, i_update_graph_metadata } from "@/types/graph";
import type { i_paging_response, i_success_response } from "@/types/base";

export const create_graph_service = async (data: i_graph_create): Promise<i_success_response<i_graph>> =>{
    try {
        const url = "/graphs";
        return await http.post(url, data);
    } catch (error) {
        throw error;
    }
}

export const update_graph_metadata_service = async (id: string, data: i_update_graph_metadata): Promise<i_success_response<i_graph>> =>{
    try {
        const url = `/graphs/${id}/update-metadata`;
        return await http.patch(url, data);
    } catch (error) {
        throw error;
    }
}

export const update_graph_service = async (id: string, data: i_graph_update): Promise<i_success_response<i_graph>> =>{
    try {
        const url = `/graphs/${id}`;
        return await http.patch(url, data);
    } catch (error) {
        throw error;
    }
}

export const get_detail_graph_service = async (id: string): Promise<i_success_response<i_graph>> => {
    try {
        const url = `/graphs/${id}`;
        return await http.get(url);
    } catch (error) {
        throw error;
    }
}

export const get_list_graphs = async ({
    page = 1,
    limit = 10
}: {
    page?: number,
    limit?: number
}): Promise<i_paging_response<i_graph[]>> => {
    try {
        const url = `/graphs`;
        return await http.get(url, {
            params: {
                page: page,
                limit: limit,
            },
        });
    } catch (error) {
        throw error;
    }
}