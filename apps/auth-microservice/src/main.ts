import { initTracing } from '../../../shared/src/lib/infra-tracing/tracing';
initTracing('auth-service');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from '../../../shared/src/lib/global-exception-filter/global-exception-filter.filter';
import Consul from 'consul';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const portInsideContainer = 3000;
  const portOnHostMachine = 3001; // The port exposed in docker-compose
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('auth');

  const host = process.env.CONSUL_HOST || '127.0.0.1';
  const consul = new Consul({ host: host, port: 8500 });

  const serviceName = 'auth-service-v1'; // The common name for the load balancer
  const instanceId = `${serviceName}-${Date.now()}`; // Unique ID for this instance
  // const serviceId = 'auth-service-v1';
  const registrationDetails = {
    name: serviceName,
    id: instanceId,
    // address: 'host.docker.internal',

    address: 'auth-microservice',
    // address: '127.0.0.1', // since currently auth in docker and gateway in local.
    port: portInsideContainer, // which is mapped in docker

    // check: {
    //   name: 'auth-service-health',
    //   // http: `http://host.docker.internal:${portOnHostMachine}/auth/health`,
    //   http: `http://auth-microservice:${portInsideContainer}/auth/health`,
    //   interval: '10s',
    //   timeout: '5s',
    // },

    check: {
      name: 'auth-service-health',
      ttl: '30s',
      timeout: '10s',
      deregister_critical_service_after: '1m',
    },
  };
  await consul.agent.service.register(registrationDetails);

  setInterval(async () => {
    try {
      // This informs Consul that the service is healthy
      await consul.agent.check.pass(`service:${instanceId}`);
    } catch (err) {
      console.error('Auth Service Failed to send heartbeat to Consul:', err);
    }
  }, 15000);


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
    .setTitle('Auth Microservice')
    .setDescription('The API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('auth/docs', app, document);
  //

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(portInsideContainer, '0.0.0.0');
  // await app.listen(portOnHostMachine);
  console.log('auth service is running');
}

bootstrap();
