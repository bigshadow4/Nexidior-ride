import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class GetRecordIdParamDto {
  @ApiProperty({ example: '0000-000-000-000', description: 'uuid of the record' })
  @IsString()
  @IsNotEmpty()
  recordId: string;
}