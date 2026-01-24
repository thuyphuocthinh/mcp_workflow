export type ResponseStatus = 'SUCCESS' | 'FAILURE';

export abstract class BaseResponse {
  status: ResponseStatus;
  timestamp: string;

  protected constructor(status: ResponseStatus) {
    this.status = status;
    this.timestamp = new Date().toISOString();
  }
}
