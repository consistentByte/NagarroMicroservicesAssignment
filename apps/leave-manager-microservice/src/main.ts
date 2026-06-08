import { initTracing } from '../../../shared/src/lib/infra-tracing/tracing';
// Initializing tracing BEFORE NestJS boots up
initTracing('leave-manager-service');

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from '../../../shared/src/lib/global-exception-filter/global-exception-filter.filter';
import Consul from 'consul';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { timeout } from 'rxjs';

async function bootstrap() {
  const portInsideContainer = 3000;
  const portOnHostMachine = 3003; // The port exposed in docker-compose
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('leave-manager');

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
    // check: {
    //   name: 'leave-manager-service-health',
    //   // http: `http://host.docker.internal:${portOnHostMachine}/health`,
    //   http: `http://leave-manager-microservice:${portInsideContainer}/health`,
    //   interval: '10s',
    //   timeout: '5s',
    // },
    check: {
      name: 'leave-manager-service-health',
      // Replace the 'http' property with 'ttl'
      ttl: '30s',
      // This setting ensures Consul removes dead instances automatically
      timeout: '10s',
      deregister_critical_service_after: '1m',
    },
  };
  await consul.agent.service.register(registrationDetails);

  // Start the heartbeat loop immediately after successful registration
  setInterval(async () => {
    try {
      // This informs Consul that the service is healthy
      await consul.agent.check.pass(`service:${instanceId}`);
    } catch (err) {
      console.error('Leave Manager Service Failed to send heartbeat to Consul:', err);
    }
  }, 15000); // Pulse every 15s, which is well within the 30s TTL window

  //

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Deregistering from Consul...`);
    try {
      await consul.agent.service.deregister(instanceId);
      console.log('Successfully deregistered.');
    } catch (err) {
      console.error('Deregistration failed:', err);
    }
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Leave Manager Microservice')
    .setDescription('The API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('leaves/docs', app, document);
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
