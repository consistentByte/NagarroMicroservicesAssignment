import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

@Global()
@Module({})
export class SharedLoggerModule {
  static forRoot(): DynamicModule {
    return {
      module: SharedLoggerModule,
      imports: [
        LoggerModule.forRoot({
          pinoHttp: {
            transport:
              process.env.NODE_ENV !== 'production'
                ? { target: 'pino-pretty' }
                : undefined,
            level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
            // Automatically adds a unique Request ID to every log
            genReqId: (req) =>
              req.headers['x-correlation-id'] ||
              Math.random().toString(36).substring(7),

            serializers: {
              res: (res) => ({ statusCode: res.statusCode }),
              req: (req) => ({ method: req.method, url: req.url }),
              // ADD THIS: This prevents Pino from trying to serialize the complex NestJS Error object
              err: (err) => {
                return {
                  type: err.type,
                  message: err.message,
                  statusCode: err.status || 500,
                };
              },
            },
          },
        }),
      ],
      exports: [LoggerModule],
    };
  }
}
