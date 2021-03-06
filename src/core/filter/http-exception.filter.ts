import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.getResponse();
    if (typeof message === 'object' && Array.isArray(message['message'])) {
      message['message'] = message['message'].join(',');
    }
    response.status(status).json(
      Object.assign(
        {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
        },
        typeof message === 'object'
          ? message
          : {
              message,
            },
      ),
    );
  }
}
