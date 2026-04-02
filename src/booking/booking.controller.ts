import { Body, Controller, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BookingService } from './booking.service';
import type { RequestWithUser } from 'src/common/types';
import { CreateBookingDto } from './dto/create.dto';
import { HandleDelayDto } from './dto/handleDelay.dto';
import { GetRecordIdParamDto } from 'src/common/dto/getRecordIdParam.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Booking')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtGuard, RolesGuard)
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @ApiOperation({ summary: 'Save a booking' })
    @Post()
    @Roles('PASSENGER') // Seuls les passagers peuvent réserver
    async create(
        @Req() req: RequestWithUser, 
        @Body() body: CreateBookingDto
    ) {
        return this.bookingService.createBooking(req.user.id, body);
    }

    @ApiOperation({ summary: 'Notice a delay' })
    @Patch('ride/:recordId/delay')
    @Roles('DRIVER', 'ADMIN') // Seuls les conducteurs ou admins déclarent un retard
    async reportDelay(
        @Param() param: GetRecordIdParamDto,
        @Body() body: HandleDelayDto
    ) {
        return this.bookingService.handleDriverDelay(param.recordId, body);
    }
}
