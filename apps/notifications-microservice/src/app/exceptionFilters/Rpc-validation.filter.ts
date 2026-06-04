import { Catch, ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';

@Catch()
export class RpcValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger('RpcValidationFilter');

  catch(exception: any, host: ArgumentsHost) {
    // This will catch validation errors specifically
    if (exception.response && exception.response.message) {
      this.logger.error('VALIDATION FAILED:', JSON.stringify(exception.response.message));
    } else {
      this.logger.error('UNCAUGHT EXCEPTION:', exception);
    }
  }
}