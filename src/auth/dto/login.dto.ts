import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  
  @ApiProperty({ example: 'gerald@gmail.com', description: 'User email' })
  @IsEmail({}, { message: 'Please, provide a valid email.' })
  email: string;

  @ApiProperty({ example: 'nexride-2026', description: 'User password' })
  @IsString()
  @MinLength(8, { message: 'The password must be at least 8 characters.' })
  password: string;

}