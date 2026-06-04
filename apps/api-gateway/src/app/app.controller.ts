import { All, Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Microservices } from './enums/microservices.enum';
import { type Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async health() {
    return { msg: 'UP' };
  }

  @All(['auth', 'auth/*path'])
  async handleProxyForAuthMicroservice(@Req() req: Request) {
    // req.url would be something like '/login'
    // pass the entire req object to the service
    console.log('request coming');
    return this.appService.proxyRequestWithLoadBalancing(
      req.url,
      req,
      Microservices.AUTH_MICROSERVICE,
    );
  }
  @All(['view-balance', 'view-balance/*path', 'leaves', 'leaves/*path'])
  async handleProxyForLeaveManagerMicroservice(@Req() req: Request) {
    console.log('request coming');
    return this.appService.proxyRequestWithLoadBalancing(
      req.url,
      req,
      Microservices.LEAVE_MANAGER_MICROSERVICE,
    );
  }
}
