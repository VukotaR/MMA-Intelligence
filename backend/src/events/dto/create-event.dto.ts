import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateEventDto {

  @IsString()
  name: string;

  @IsDateString()
  date: Date;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  poster?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsNumber()
  organizationId: number;

}