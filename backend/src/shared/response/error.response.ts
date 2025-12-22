import { BaseResponse } from './base.response';

export class ErrorResponse extends BaseResponse {
  message: string;

  constructor(message: string) {
    super('FAILURE');
    this.message = message;
  }
}
