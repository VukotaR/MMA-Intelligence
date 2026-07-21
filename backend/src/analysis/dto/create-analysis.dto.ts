import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { AnalysisStatus } from '../entities/analysis.entity';

export class CreateAnalysisDto {
  @ApiProperty({
    example: 'Lightweight tactical matchup analysis',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiProperty({
    example: 1,
    description: 'Red corner fighter ID',
  })
  @IsInt()
  @Min(1)
  redFighterId: number;

  @ApiProperty({
    example: 2,
    description: 'Blue corner fighter ID',
  })
  @IsInt()
  @Min(1)
  blueFighterId: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Coach user ID',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  coachId?: number | null;

  @ApiProperty({
    example:
      'The matchup favors the red corner in wrestling exchanges, while the blue corner has a reach advantage.',
  })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiPropertyOptional({
    example:
      'Pressure wrestling, strong cage control and high takedown accuracy.',
  })
  @IsOptional()
  @IsString()
  redFighterStrengths?: string;

  @ApiPropertyOptional({
    example:
      'Limited striking output at long range.',
  })
  @IsOptional()
  @IsString()
  redFighterWeaknesses?: string;

  @ApiPropertyOptional({
    example:
      'Reach advantage, accurate jab and strong distance management.',
  })
  @IsOptional()
  @IsString()
  blueFighterStrengths?: string;

  @ApiPropertyOptional({
    example:
      'Weak takedown defense when pressured against the cage.',
  })
  @IsOptional()
  @IsString()
  blueFighterWeaknesses?: string;

  @ApiProperty({
    example:
      'Close the distance, force the opponent toward the cage and combine boxing entries with takedowns.',
  })
  @IsString()
  @IsNotEmpty()
  overallStrategy: string;

  @ApiPropertyOptional({
    example:
      'Use double jabs and body shots to create wrestling entries.',
  })
  @IsOptional()
  @IsString()
  strikingStrategy?: string;

  @ApiPropertyOptional({
    example:
      'Prioritize cage wrestling, body locks and top control.',
  })
  @IsOptional()
  @IsString()
  grapplingStrategy?: string;

  @ApiPropertyOptional({
    example:
      'Avoid prolonged exchanges at kicking range and keep the lead hand high.',
  })
  @IsOptional()
  @IsString()
  defensiveStrategy?: string;

  @ApiPropertyOptional({
    example:
      'Establish pressure, test reactions and attack the lead leg.',
  })
  @IsOptional()
  @IsString()
  roundOnePlan?: string;

  @ApiPropertyOptional({
    example:
      'Increase wrestling pressure and attack the body during clinch exchanges.',
  })
  @IsOptional()
  @IsString()
  roundTwoPlan?: string;

  @ApiPropertyOptional({
    example:
      'Maintain cage control and avoid unnecessary striking exchanges.',
  })
  @IsOptional()
  @IsString()
  roundThreePlan?: string;

  @ApiPropertyOptional({
    example:
      'Manage cardio carefully and prioritize positional control in rounds four and five.',
  })
  @IsOptional()
  @IsString()
  championshipRoundsPlan?: string;

  @ApiPropertyOptional({
    example:
      'Body, lead leg and opponent reactions after the jab.',
  })
  @IsOptional()
  @IsString()
  keyTargets?: string;

  @ApiPropertyOptional({
    example:
      'Do not shoot from long range and avoid backing up in straight lines.',
  })
  @IsOptional()
  @IsString()
  risksToAvoid?: string;

  @ApiPropertyOptional({
    example:
      'If takedowns fail, switch to clinch control and body attacks.',
  })
  @IsOptional()
  @IsString()
  contingencyPlan?: string;

  @ApiPropertyOptional({
    example:
      'Focus on patience and do not chase an early finish.',
  })
  @IsOptional()
  @IsString()
  coachNotes?: string;

  @ApiPropertyOptional({
    enum: AnalysisStatus,
    default: AnalysisStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(AnalysisStatus)
  status?: AnalysisStatus;
}