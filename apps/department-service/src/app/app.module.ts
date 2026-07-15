// apps/department-service/src/app/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  IopCommonUtilitiesModule,
  LoggerModule,
} from '@my-nest-workspace/iop-common-utilities';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/department-service/.env', '.env'],
    }),
    LoggerModule.register({ serviceName: 'department-service' }),

    // DepartmentModule FIRST — registers Department entity via forFeature()
    // autoLoadEntities:true in DbConnectionModule picks it up
    DepartmentModule,

    IopCommonUtilitiesModule,
  ],
})
export class AppModule {}