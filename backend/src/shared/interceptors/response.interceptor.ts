import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '../response/success.response';
import { PagingResponse } from '../response/paging.response';


@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((result) => {
        if (result?.paging) {
          return new PagingResponse(result.data, result.paging);
        }
        return new SuccessResponse(result);
      }),
    );
  }
}
