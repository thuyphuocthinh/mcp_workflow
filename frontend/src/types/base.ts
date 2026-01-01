export type i_status = "SUCCESS" | "FAILURE";

export interface i_base_response {
    status: i_status;
    timestamp: string;
}

export interface i_success_response<T> extends i_base_response {
    message?: string;
    data?: T;
}

export interface i_error_response extends i_base_response {
    message: string;
}

export interface i_paging {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface i_paging_response<T> extends i_success_response<T> {
    paging: i_paging;
}