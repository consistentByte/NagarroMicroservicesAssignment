import { initTracing } from '../../../shared/src/lib/infra-tracing/tracing';
// Initializing tracing BEFORE NestJS boots up
initTracing('api-gateway');
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from '../../../shared/src/lib/global-exception-filter/global-exception-filter.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API GATEWAY Microservice')
    .setDescription('The API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('leaves/docs', app, document); // Access at /leaves/docs
  //

  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 3002;
  await app.listen(port);
}

bootstrap();
