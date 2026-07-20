import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

import { WeightClass } from '../../fighters/enums/weight-class.enum';
import { FightStatus } from '../enums/fight-status.enum';
import { FightMethod } from '../enums/fight-method.enum';
import { CardPosition } from '../enums/card-position.enum';
import { AnalysisStatus } from '../enums/analysis-status.enum';

export class CreateFightDto {
  @IsInt()
  @IsPositive()
  eventId: number;

  @IsInt()
  @IsPositive()
  redCornerId: number;

  @IsInt()
  @IsPositive()
  blueCornerId: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  winnerId?: number;

  @IsEnum(WeightClass)
  weightClass: WeightClass;

  @IsEnum(FightStatus)
  @IsOptional()
  status?: FightStatus;

  @IsEnum(CardPosition)
  @IsOptional()
  cardPosition?: CardPosition;

  @IsEnum(FightMethod)
  @IsOptional()
  method?: FightMethod;

  @IsString()
  @IsOptional()
  methodDetails?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  scheduledRounds?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  finishedRound?: number;

  @IsString()
  @IsOptional()
  finishedTime?: string;

  @IsBoolean()
  @IsOptional()
  titleFight?: boolean;

  @IsString()
  @IsOptional()
  youtubeUrl?: string;

  @IsEnum(AnalysisStatus)
  @IsOptional()
  analysisStatus?: AnalysisStatus;

  @IsString()
  @IsOptional()
  analysisSummary?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  cardOrder?: number;
}