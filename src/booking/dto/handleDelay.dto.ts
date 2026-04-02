import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class HandleDelayDto {
  
  @ApiProperty({ example: '15', description: 'Delay noticed by the driver (In minutes)' })
  @IsInt()
  @IsNotEmpty()
  additionalMinutes: number;
}