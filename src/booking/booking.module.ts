import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
    imports: [PrismaModule],
    providers: [BookingService,JwtStrategy,JwtGuard, EventEmitter2],
    controllers: [BookingController]
})
export class BookingModule {}
