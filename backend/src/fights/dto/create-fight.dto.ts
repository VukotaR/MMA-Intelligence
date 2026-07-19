import {
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';


export class CreateFightDto {


  @IsNumber()
  eventId: number;



  @IsNumber()
  redCornerId: number;



  @IsNumber()
  blueCornerId: number;



  @IsOptional()
  @IsNumber()
  winnerId?: number;



  @IsOptional()
  @IsString()
  method?: string;



  @IsOptional()
  @IsNumber()
  round?: number;



  @IsOptional()
  @IsString()
  time?: string;



  @IsOptional()
  @IsString()
  status?: string;



  @IsOptional()
  @IsString()
  videoUrl?: string;



  @IsOptional()
  @IsString()
  description?: string;

}