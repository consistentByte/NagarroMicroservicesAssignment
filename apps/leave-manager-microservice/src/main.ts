import { initTracing } from '../../../shared/src/lib/infra-tracing/tracing';
// Initializing tracing BEFORE NestJS boots up
initTracing('leave-manager-service');

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from '../../../shared/src/lib/global-exception-filter/global-exception-filter.filter';
import Consul from 'consul';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const portInsideContainer = 3000;
  const portOnHostMachine = 3003; // The port exposed in docker-compose
  const app = await NestFactory.create(AppModule);

  const host = process.env.CONSUL_HOST || '127.0.0.1';
  const consul = new Consul({ host: host, port: 8500 });

  const serviceName = 'leave-manager-service-v1'; // The common name for the load balancer
  const instanceId = `${serviceName}-${Date.now()}`; // Unique ID for this instance
  // const serviceId = 'leave-manager-service-v1';
  const registrationDetails = {
    name: serviceName,
    // name: 'leave-manager-service-v1',
    address: 'leave-manager-microservice', // for docker
    port: portInsideContainer,
    // address: '127.0.0.1', // since currently this microservice is in docker and gateway in local.
    // port: portOnHostMachine, // which is mapped in docker

    id: instanceId,
    check: {
      name: 'leave-manager-service-health',
      // http: `http://host.docker.internal:${portOnHostMachine}/health`,
      http: `http://leave-manager-microservice:${portInsideContainer}/health`,
      interval: '10s',
      timeout: '5s',
    },
  };
  await consul.agent.service.register(registrationDetails);

  // on close deregister the application
  process.on('SIGINT', async () => {
    await consul.agent.service.deregister(instanceId); // tell which service to deregister.
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Leave Manager Microservice')
    .setDescription('The API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('auth/docs', app, document); // Access at /auth/docs
  //

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip out properties not in the DTO
      forbidNonWhitelisted: true, // Throw an error if extra properties are sent
      transform: true, // Automatically transform input to DTO instance
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(portInsideContainer);
  // await app.listen(portOnHostMachine);

  console.log('leave manager service is running');
}

bootstrap();
