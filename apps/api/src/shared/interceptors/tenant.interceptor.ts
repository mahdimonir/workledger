import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from '../context/tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req  = ctx.switchToHttp().getRequest();
    const user = req.user;

    
    if (!user?.workspaceId) return next.handle();

    return new Observable(observer => {
      tenantContext.run(
        {
          workspaceId: user.workspaceId,
          userId:      user.id || user.userId,
          role:        user.role,
          plan:        user.plan,
        },
        () => next.handle().subscribe(observer),
      );
    });
  }
}
