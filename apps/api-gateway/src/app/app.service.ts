import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Consul from 'consul';
import { Microservices } from './enums/microservices.enum';
import {
  AUTH_MICROSERVICE_SERVICE_ID,
  AUTH_MICROSERVICE_SERVICE_NAME,
  LEAVE_MANAGER_MICROSERVICE_SERVICE_ID,
  LEAVE_MANAGER_MICROSERVICE_SERVICE_NAME,
} from '../constants';
import { Method } from 'axios';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppService {
  private consul = new Consul({
    host: process.env.CONSUL_HOST || '127.0.0.1',
    // host: '127.0.0.1',
    port: 8500,
  });
  private registry: Record<
    Microservices,
    { serviceName: string; index: number }
  > = {
    [Microservices.AUTH_MICROSERVICE]: {
      serviceName: AUTH_MICROSERVICE_SERVICE_NAME,
      index: 0,
    },
    [Microservices.LEAVE_MANAGER_MICROSERVICE]: {
      serviceName: LEAVE_MANAGER_MICROSERVICE_SERVICE_NAME,
      index: 0,
    },
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AppService.name);
  }

  async proxyRequestWithLoadBalancing(
    endpoint: string,
    incomingRequest: Request,
    microservice: Microservices,
  ) {
    const config = this.registry[microservice];
    console.log(config);

    if (!config) {
      throw new BadRequestException('Microservice not configured');
    }

    // 1. Fetch healthy instances
    const health = await this.consul.health.service({
      service: config.serviceName,
      passing: true,
    });

    this.logger.info(health);

    if (!health.length) {
      this.logger.warn('No Instances Fetched');
      throw new HttpException(
        'Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // 2. Round Robin Logic
    const selectedInstance = health[config.index % health.length];

    this.logger.info(selectedInstance);
    // Increment index and cycle back to 0 at the length of healthy services
    config.index = (config.index + 1) % health.length;

    // 3. Build URL and Forward
    const url = `http://${selectedInstance.Service.Address}:${selectedInstance.Service.Port}${endpoint}`;

    // 3. Forward the request
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: incomingRequest.method as Method,
          url: url,
          data: incomingRequest.body,
          headers: {
            ...incomingRequest.headers, // Headers forwarded
            host: undefined, // Removed gateway host to prevent conflicts
            'content-length': undefined, // Force Axios to recalculate
            'content-type': 'application/json', // Ensure this is set
          },
        }),
      );
      this.logger.info('RESPONSE', response.data);
      return response.data;
    } catch (error: any) {
      // If the error came from Axios (the service returned a 4xx or 5xx)
      if (error.response) {
        this.logger.error(`Proxy Error: ${JSON.stringify(error.response.data)}`);
        // This throws the original status and the original JSON body
        throw new HttpException(error.response.data, error.response.status);
      }

      // If the error is something else (like network timeout), treat as 503
      throw new HttpException(
        'Service WILL BE AVAILABLE',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async proxyRequest(
    endpoint: string,
    incomingRequest: Request,
    microservice: Microservices,
  ) {
    // 1. Discover the service
    console.log('IN SERVICE TO HIT CONSUL');
    const services = await this.consul.agent.service.list();
    console.log(services);
    const serviceId = this.getServiceId(microservice);
    if (!serviceId) {
      throw new BadRequestException('Wrong Endpoint');
    }

    const serviceInfo = services[serviceId];

    if (!serviceInfo) {
      throw new HttpException('Auth service not found', HttpStatus.NOT_FOUND);
    }

    // 2. Build the URL (Using 127.0.0.1 for local dev)
    const url = `http://127.0.0.1:${serviceInfo.Port}${endpoint}`;
    // 3. Forward the request
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: incomingRequest.method as Method,
          url: url,
          data: incomingRequest.body,
          headers: {
            ...incomingRequest.headers, // Headers forwarded
            host: undefined, // Removed gateway host to prevent conflicts
            'content-length': undefined, // Force Axios to recalculate
            'content-type': 'application/json', // Ensure this is set
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Failed to reach Microservice',
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  getServiceId(microservice: Microservices) {
    if (microservice === Microservices.AUTH_MICROSERVICE) {
      return AUTH_MICROSERVICE_SERVICE_ID;
    } else if (microservice === Microservices.LEAVE_MANAGER_MICROSERVICE) {
      return LEAVE_MANAGER_MICROSERVICE_SERVICE_ID;
    }
    return null;
  }

  getServiceName(microservice: Microservices) {
    if (microservice === Microservices.AUTH_MICROSERVICE) {
      return AUTH_MICROSERVICE_SERVICE_NAME;
    } else if (microservice === Microservices.LEAVE_MANAGER_MICROSERVICE) {
      return LEAVE_MANAGER_MICROSERVICE_SERVICE_ID;
    }
    return null;
  }
}
