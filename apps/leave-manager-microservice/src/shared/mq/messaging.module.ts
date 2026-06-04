import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATION_CLIENT, NOTIFICATION_SERVICE_RABBITMQ } from '../constants';

@Global()
@Module({})
export class SharedMessagingModule {
  static register(): DynamicModule {
    return {
      module: SharedMessagingModule,
      imports: [
        ClientsModule.register([
          //   {
          //     name: 'RABBITMQ_SERVICE',
          //     transport: Transport.RMQ,
          //     options: {
          //       urls: [process.env.RABBITMQ_URL],
          //       queue: 'notification_queue',
          //     },
          //   },
          {
            name: NOTIFICATION_CLIENT,
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL!], // 127.0.0.1 in dev without docker, with docker image name of mq.
              queue: 'notification_queue',
              queueOptions: {
                durable: true,
              },
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
