import { Injectable } from '@nestjs/common';
import { CreateFightStatisticDto } from './dto/create-fight-statistic.dto';
import { UpdateFightStatisticDto } from './dto/update-fight-statistic.dto';

@Injectable()
export class FightStatisticsService {
  create(createFightStatisticDto: CreateFightStatisticDto) {
    return 'This action adds a new fightStatistic';
  }

  findAll() {
    return `This action returns all fightStatistics`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fightStatistic`;
  }

  update(id: number, updateFightStatisticDto: UpdateFightStatisticDto) {
    return `This action updates a #${id} fightStatistic`;
  }

  remove(id: number) {
    return `This action removes a #${id} fightStatistic`;
  }
}
