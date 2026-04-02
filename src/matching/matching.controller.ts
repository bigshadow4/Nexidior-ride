import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MatchingService } from './matching.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { RequestWithUser } from 'src/common/types';
import { GetPerfectMatchDto } from './dto/get.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Matching')
@ApiBearerAuth()
@Controller('matching')
@UseGuards(JwtGuard, RolesGuard)
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) {}
    
        @ApiOperation({ summary: 'Get the perfect match' })
        @Get('passenger')
        @Roles('PASSENGER') // Seuls les passagers peuvent réserver
        async create(
            @Req() req: RequestWithUser, 
            @Query() query: GetPerfectMatchDto
        ) {
            return this.matchingService.findPerfectMatches(req.user.id, query);
        }
}
