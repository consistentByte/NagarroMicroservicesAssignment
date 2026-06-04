import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as CircuitBreakerImport from 'opossum';
import { Observable, from, lastValueFrom } from 'rxjs';

const CircuitBreaker =
  (CircuitBreakerImport as any).default || CircuitBreakerImport;

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private breaker: any;

  constructor(private readonly logger: PinoLogger) {
    this.breaker = new CircuitBreaker(
      // The action must be a function that returns a Promise
      (handler: Observable<any>) => lastValueFrom(handler),
      {
        timeout: 8000, // trigger failure if service takes more than 8s
        errorThresholdPercentage: 70,
        resetTimeout: 10000,
      },
    );
    this.breaker.fallback((error: any) => {
      // return {
      //   message: 'Service will be available shortly',
      //   status: 404,
      // };
      throw error;
    });

    this.breaker.on('open', () =>
      this.logger.warn('CIRCUIT BREAKER: State changed to OPEN'),
    );
    this.breaker.on('halfOpen', () =>
      this.logger.warn('CIRCUIT BREAKER: State changed to HALF-OPEN'),
    );
    this.breaker.on('close', () =>
      this.logger.warn('CIRCUIT BREAKER: State changed to CLOSED'),
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return from(this.breaker.fire(next.handle()));
  }
}
