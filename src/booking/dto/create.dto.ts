import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateBookingDto {
  
  @ApiProperty({ example: 'uuid-rideId', description: 'Id of the ride' })
  @IsString()
  @IsNotEmpty()
  rideId: string;
}