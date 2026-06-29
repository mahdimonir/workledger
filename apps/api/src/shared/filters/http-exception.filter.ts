import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger
} from '@nestjs/common';
import { nanoid } from 'nanoid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse();
    const request  = ctx.getRequest();
    const requestId = nanoid();

    const status  = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    
    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    }

    response.status(status).json({
      error: {
        status,
        message:   typeof message === 'object' ? (message as any).message : message,
        requestId,
        path:      request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
