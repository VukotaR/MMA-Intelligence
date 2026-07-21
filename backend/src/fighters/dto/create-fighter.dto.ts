import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsEnum,
  Min,
  Max,
  MinLength,
} from 'class-validator';

import { WeightClass } from '../enums/weight-class.enum';

export class CreateFighterDto {

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsString()
  @MinLength(2)
  country: string;

  @IsNumber()
  @Min(18)
  @Max(60)
  age: number;

  @IsNumber()
  @Min(140)
  @Max(230)
  height: number;

  @IsNumber()
  @Min(45)
  @Max(180)
  weight: number;

  @IsOptional()
@IsEnum(WeightClass)
weightClass?: WeightClass;

  @IsOptional()
  @IsNumber()
  @Min(120)
  @Max(250)
  reach?: number;

  @IsOptional()
  @IsString()
  stance?: string;

  @IsOptional()
  @IsString()
  fightingStyle?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wins?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  losses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  draws?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  koWins?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  submissionWins?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  decisionWins?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentWinStreak?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  strikingAccuracy?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  strikingDefense?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  significantStrikesPerMinute?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  significantStrikesAbsorbedPerMinute?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  takedownAccuracy?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  takedownDefense?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  takedownsPer15?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  submissionAverage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  ranking?: number;

  @IsOptional()
  @IsBoolean()
  champion?: boolean;

  @IsOptional()
  @IsBoolean()
  interimChampion?: boolean;
}