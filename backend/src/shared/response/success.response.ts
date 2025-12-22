import { BaseResponse } from './base.response';

export class SuccessResponse<T = any> extends BaseResponse {
  data?: T;
  message?: string;

  constructor(options?: {
    data?: T;
    message?: string;
  }) {
    super('SUCCESS');
    this.data = options?.data;
    this.message = options?.message;
  }
}
