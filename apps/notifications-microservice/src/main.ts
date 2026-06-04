import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RpcValidationFilter } from './app/exceptionFilters/Rpc-validation.filter';

async function bootstrap() {

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        // urls: ['amqp://guest:guest@127.0.0.1:5672'],
        urls: ['amqp://guest:guest@rabbitmq:5672'],
        queue: 'notification_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.useGlobalFilters(new RpcValidationFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip out properties not in the DTO
      forbidNonWhitelisted: true, // Throw an error if extra properties are sent
      transform: true, // Automatically transform input to DTO instance
    }),
  );

  await app.listen();
  Logger.log(`Notification Microservice listening to RabbitMq`);
}

bootstrap();
