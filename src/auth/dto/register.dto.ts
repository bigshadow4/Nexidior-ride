import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  
  @ApiProperty({ example: 'gerald@gmail.com', description: 'User email' })
  @IsEmail({}, { message: 'Please, provide a valid email.' })
  email: string;

  @ApiProperty({ example: 'nexride-2026', description: 'User password' })
  @IsString()
  @MinLength(8, { message: 'The password must be at least 8 characters.' })
  password: string;

  @ApiProperty({ example: 'Gérald O.', description: 'User name' })
  @IsString()
  @MinLength(5, { message: 'The name must be at least 5 characters.' })
  name: string;

  @ApiProperty({ example: 'DRIVER', description: 'User role' })
  @IsEnum(Role) 
  role: Role


}