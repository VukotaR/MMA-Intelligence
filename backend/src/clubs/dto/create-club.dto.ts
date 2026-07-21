import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength
} from 'class-validator';

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  country: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  city: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true
  })
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  coachId?: number;
}