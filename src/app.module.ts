import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MovieModule } from './movie/movie.module';
import { Movie } from './movie/entities/movie.entity';
import { MovieDetail } from './movie/entities/movie-detail.entity';
import { BaseTable } from './common/entity/base-table.entity';
import { DirectorModule } from './director/director.module';
import { Director } from './director/entities/director.entity';
import { GenreModule } from './genre/genre.module';
import { Genre } from './genre/entities/genre.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { CustomAuthGuard } from './auth/guard/auth.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomRBACGuard } from './auth/guard/rbac.guard';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import {envVariableKeys} from './common/const/env.const';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.get<string>(envVariableKeys.dbType) as 'postgres',
          host: configService.get<string>(envVariableKeys.dbHost),
          port: configService.get<number>(envVariableKeys.dbPort),
          username: configService.get<string>(envVariableKeys.dbUsername),
          password: configService.get<string>(envVariableKeys.dbPassword),
          database: configService.get<string>(envVariableKeys.dbDatabase),
          entities: [Movie, MovieDetail, BaseTable, Director, Genre, User],
          synchronize: true, // 개발할때만 true. 개발 시 싱크 자동 맞추기
        };
      },
      inject: [ConfigService],
    }),
    MovieModule,
    DirectorModule,
    GenreModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomAuthGuard,
    },
    {
      // CustomAuthGuard 밑에다가 달아주기 (AuthGuard 다음으로 걸릴 가드)
      provide: APP_GUARD,
      useClass: CustomRBACGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude(
        {
          path: '/auth/login',
          method: RequestMethod.POST,
        },
        {
          path: '/auth/register',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
