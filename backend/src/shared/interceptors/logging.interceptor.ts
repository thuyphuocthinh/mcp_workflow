import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const duration = Date.now() - start;

        this.logger.log(
          `${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
        );
      }),
      catchError((err) => {
        const duration = Date.now() - start;

        this.logger.error(
          `${method} ${originalUrl} ERROR - ${duration}ms`,
          err.stack,
        );

        return throwError(() => err);
      }),
    );
  }
}
