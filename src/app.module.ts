import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MatchingModule } from './matching/matching.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';
import { PerformanceMiddleware } from './common/middlewares/performance.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MatchingModule, BookingModule, AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule  {
    configure(consumer: MiddlewareConsumer) {
      // Applique le middleware sur toutes les routes de l'API
      consumer.apply(PerformanceMiddleware).forRoutes('*');
    }
}
