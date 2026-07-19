import { Test, TestingModule } from '@nestjs/testing';
import { FightStatisticsController } from './fight-statistics.controller';
import { FightStatisticsService } from './fight-statistics.service';

describe('FightStatisticsController', () => {
  let controller: FightStatisticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FightStatisticsController],
      providers: [FightStatisticsService],
    }).compile();

    controller = module.get<FightStatisticsController>(FightStatisticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
