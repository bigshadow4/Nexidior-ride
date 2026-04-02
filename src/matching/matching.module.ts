import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { JwtGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
    imports: [PrismaModule],
    providers: [MatchingService,JwtStrategy,JwtGuard],
    controllers: [MatchingController]
})
export class MatchingModule {}
