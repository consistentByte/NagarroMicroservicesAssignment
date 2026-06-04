import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isObservable } from 'rxjs';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const status =
    //   exception instanceof HttpException
    //     ? exception.getStatus()
    //     : HttpStatus.BAD_REQUEST;

    if (isObservable(exception)) {
      return exception.subscribe({
        next: (value) => {
          console.log('value', value);
          response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            timestamp: new Date().toISOString(),
            message: value,
          });
        },
        error: (err) => {
          console.log('errr', err)
          response
            .status(
              err?.status ||
                err?.statusCode ||
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
            .json({
              statusCode:
                err?.status ||
                err?.statusCode ||
                HttpStatus.INTERNAL_SERVER_ERROR,
              timestamp: new Date().toISOString(),
              message:
                err?.response?.data || err?.response || err?.message || err,
            });
        },
      });
    }

    const status =
      exception.status ||
      exception.response?.status ||
      HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const rawMessage =
      exception.response?.data ||
      exception.getResponse?.() ||
      exception.message ||
      'Internal server error';

    console.log('Exception caught by Global Filter:', status, exception); // Add this
    // Standardized error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: rawMessage,
    });
  }
}
