import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as CircuitBreakerImport from 'opossum';
import { Observable, from, lastValueFrom, of } from 'rxjs';

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
        timeout: 20000, // trigger failure if service takes more than 8s
        errorThresholdPercentage: 70,
        resetTimeout: 12000, // circuit stays open for 12sec
      },
    );
    this.breaker.fallback((error: any) => {
      // return {
      //   message: 'Service  shortly',
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

  if (this.breaker.opened) {
    const remainingTime = this.breaker.opened 
      ? Math.max(0, (this.breaker.options.resetTimeout - (Date.now() - this.breaker.openedTime)) / 1000)
      : 0;
      throw new HttpException(
        {
          message: `circuit is currently in OPEN state. Wait for few mins.`,
          // remainingTime: `${Math.round(remainingTime)}s`,
          status: 503,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
  }

    return from(this.breaker.fire(next.handle()));
  }
}
