import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { apiConfig, appConfig, databaseConfig } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodesService } from '../codes/codes.service';
import { CodesModule } from 'src/codes/codes.module';
import { TaskModule } from 'src/tasks/task.module';

import { NotFoundFilter } from '../middlewares/notFound.handler';
import { TimeoutMiddleware } from '../middlewares/timeout.middleware';
import { PayloadMiddleware } from '../middlewares/payload.middleware';
import { NetworkMiddleware } from '../middlewares/network.middleware';
import { HeadersMiddleware } from '../middlewares/headers.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      ignoreEnvVars: false,
      envFilePath: 'config.env',
      load: [appConfig, apiConfig, databaseConfig],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    CodesModule,
    TaskModule

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: NotFoundFilter,
    },
    CodesService
  ],
})

export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      TimeoutMiddleware,
      PayloadMiddleware,
      NetworkMiddleware,
      HeadersMiddleware
    ).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    });
  }

}

