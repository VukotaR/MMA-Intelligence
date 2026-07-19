import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import {
  InjectRepository,
} from '@nestjs/typeorm';


import {
  Repository,
} from 'typeorm';


import { FightStatistic } from './entities/fight-statistic.entity';

import { Fight } from '../fights/entities/fight.entity';


import { CreateFightStatisticDto } from './dto/create-fight-statistic.dto';

import { UpdateFightStatisticDto } from './dto/update-fight-statistic.dto';



@Injectable()
export class FightStatisticsService {


constructor(

@InjectRepository(FightStatistic)
private readonly statisticRepository:
Repository<FightStatistic>,


@InjectRepository(Fight)
private readonly fightRepository:
Repository<Fight>,


){}





async create(
dto:CreateFightStatisticDto
){


const fight =
await this.fightRepository.findOne({

where:{
id:dto.fightId
}

});



if(!fight){

throw new NotFoundException(
'Fight not found'
);

}




const statistic =
this.statisticRepository.create({

fight,

redSignificantStrikes:
dto.redSignificantStrikes,


blueSignificantStrikes:
dto.blueSignificantStrikes,


redTakedowns:
dto.redTakedowns,


blueTakedowns:
dto.blueTakedowns,


redControlTime:
dto.redControlTime,


blueControlTime:
dto.blueControlTime,


redSubmissionAttempts:
dto.redSubmissionAttempts,


blueSubmissionAttempts:
dto.blueSubmissionAttempts,


redKnockdowns:
dto.redKnockdowns,


blueKnockdowns:
dto.blueKnockdowns,

});



return this.statisticRepository.save(
statistic
);

}








findAll(){

return this.statisticRepository.find();

}









async findOne(
id:number
){


const statistic =
await this.statisticRepository.findOne({

where:{
id
}

});



if(!statistic){

throw new NotFoundException(
'Statistics not found'
);

}


return statistic;

}









async update(
id:number,
dto:UpdateFightStatisticDto
){


const statistic =
await this.findOne(id);



Object.assign(
statistic,
dto
);



return this.statisticRepository.save(
statistic
);


}









async remove(
id:number
){


const statistic =
await this.findOne(id);



return this.statisticRepository.remove(
statistic
);

}


}