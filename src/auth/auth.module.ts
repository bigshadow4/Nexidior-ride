import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtRefreshGuard } from 'src/common/guards/jwt-refresh.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtGuard } from 'src/common/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [
    AuthService,
    JwtRefreshStrategy,
    JwtRefreshGuard,
    JwtStrategy,
    JwtGuard,
  ],
  controllers: [AuthController]
})
export class AuthModule {}
