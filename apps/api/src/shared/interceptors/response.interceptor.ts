import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { nanoid } from 'nanoid';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(result => {
        
        if (result && typeof result === 'object' && 'data' in result && 'pagination' in result) {
          return {
            data: result.data,
            meta: {
              requestId: nanoid(),
              timestamp: new Date().toISOString(),
              version:   'v1',
              total:     result.pagination.total,
              page:      result.pagination.page,
              limit:     result.pagination.limit,
              hasNext:   result.pagination.hasNext,
            },
          };
        }

        return {
          data: result,
          meta: {
            requestId: nanoid(),
            timestamp: new Date().toISOString(),
            version:   'v1',
          },
        };
      }),
    );
  }
}
