import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


export class GetPerfectMatchDto {
    @ApiProperty({ example: '10', description: 'Value of the passenger latitude (In float)' })
    @Type(() => Number)
    @IsNotEmpty({message: 'GPS coordinates (lat) are required to start the engine.'})
    @IsNumber()
    @Min(-90, { message: 'Latitude must be greater than or equal to -90.' })
    @Max(90, { message: 'Latitude must be less than or equal to 90.' })
    lat: number;

    @ApiProperty({ example: '20', description: 'Value of the passenger longitude (In float)' })
    @Type(() => Number)
    @IsNotEmpty({message: 'GPS coordinates (lng) are required to start the engine.'})
    @IsNumber()
    @Min(-180, { message: 'Longitude must be greater than or equal to -180.' })
    @Max(180, { message: 'Longitude must be less than or equal to 180.' })
    lng: number;
}