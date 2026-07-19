import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateFighterDto {


  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsString()
  country: string;

  @IsNumber()
  age: number;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsOptional()
  @IsNumber()
  reach?: number;

  @IsOptional()
  @IsString()
  stance?: string;

  @IsOptional()
  @IsString()
  fightingStyle?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  bio?: string;


  @IsOptional()
  @IsNumber()
  wins?: number;

  @IsOptional()
  @IsNumber()
  losses?: number;

  @IsOptional()
  @IsNumber()
  draws?: number;

  @IsOptional()
  @IsNumber()
  koWins?: number;

  @IsOptional()
  @IsNumber()
  submissionWins?: number;

  @IsOptional()
  @IsNumber()
  decisionWins?: number;

  @IsOptional()
  @IsNumber()
  currentWinStreak?: number;


  @IsOptional()
  @IsNumber()
  strikingAccuracy?: number;

  @IsOptional()
  @IsNumber()
  strikingDefense?: number;

  @IsOptional()
  @IsNumber()
  significantStrikesPerMinute?: number;

  @IsOptional()
  @IsNumber()
  significantStrikesAbsorbedPerMinute?: number;


  @IsOptional()
  @IsNumber()
  takedownAccuracy?: number;

  @IsOptional()
  @IsNumber()
  takedownDefense?: number;

  @IsOptional()
  @IsNumber()
  takedownsPer15?: number;

  @IsOptional()
  @IsNumber()
  submissionAverage?: number;


  @IsOptional()
  @IsNumber()
  ranking?: number;

  @IsOptional()
  @IsBoolean()
  champion?: boolean;

  @IsOptional()
  @IsBoolean()
  interimChampion?: boolean;

}