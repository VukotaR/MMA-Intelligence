import { IsNumber, Min, Max } from 'class-validator';

export class CompareFightersDto {

  @IsNumber()
  fighterOneId: number;

  @IsNumber()
  fighterTwoId: number;

  @IsNumber()
  @Min(3)
  @Max(5)
  rounds: number;

}