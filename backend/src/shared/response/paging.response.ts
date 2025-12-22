import { SuccessResponse } from './success.response';

export interface PagingMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export class PagingResponse<T = any> extends SuccessResponse<T> {
  paging: PagingMeta;

  constructor(data: T, paging: PagingMeta) {
    super(data);
    this.paging = paging;
  }
}
