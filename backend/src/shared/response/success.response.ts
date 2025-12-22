import { BaseResponse } from './base.response';

export class SuccessResponse<T = any> extends BaseResponse {
  data: T;

  constructor(data: T) {
    super('SUCCESS');
    this.data = data;
  }
}
