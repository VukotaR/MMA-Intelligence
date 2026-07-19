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


import { Fight } from './entities/fight.entity';

import { Fighter } from '../fighters/entities/fighter.entity';

import { Event } from '../events/entities/event.entity';


import { CreateFightDto } from './dto/create-fight.dto';

import { UpdateFightDto } from './dto/update-fight.dto';



@Injectable()
export class FightsService {


constructor(

@InjectRepository(Fight)
private readonly fightRepository:
Repository<Fight>,


@InjectRepository(Fighter)
private readonly fighterRepository:
Repository<Fighter>,


@InjectRepository(Event)
private readonly eventRepository:
Repository<Event>,


){}





async create(
dto:CreateFightDto
){


const event =
await this.eventRepository.findOne({
where:{
id:dto.eventId
}
});


if(!event){

throw new NotFoundException(
'Event not found'
);

}



const redCorner =
await this.fighterRepository.findOne({
where:{
id:dto.redCornerId
}
});


if(!redCorner){

throw new NotFoundException(
'Red corner fighter not found'
);

}



const blueCorner =
await this.fighterRepository.findOne({
where:{
id:dto.blueCornerId
}
});


if(!blueCorner){

throw new NotFoundException(
'Blue corner fighter not found'
);

}




let winner: Fighter | undefined;



if(dto.winnerId){


winner =
await this.fighterRepository.findOne({
where:{
id:dto.winnerId
}
}) || undefined;



if(!winner){

throw new NotFoundException(
'Winner fighter not found'
);

}

}




const fight =
this.fightRepository.create({

event,

redCorner,

blueCorner,

winner,

method:dto.method,

round:dto.round,

time:dto.time,

status:dto.status,

videoUrl:dto.videoUrl,

description:dto.description,

});



return this.fightRepository.save(
fight
);

}







findAll(){

return this.fightRepository.find();

}







async findOne(
id:number
){


const fight =
await this.fightRepository.findOne({

where:{
id
}

});



if(!fight){

throw new NotFoundException(
'Fight not found'
);

}


return fight;

}







async update(
id:number,
dto:UpdateFightDto
){


const fight =
await this.findOne(id);




if(dto.eventId){


const event =
await this.eventRepository.findOne({

where:{
id:dto.eventId
}

});


if(event){

fight.event = event;

}

}





if(dto.redCornerId){


const fighter =
await this.fighterRepository.findOne({

where:{
id:dto.redCornerId
}

});


if(fighter){

fight.redCorner = fighter;

}

}





if(dto.blueCornerId){


const fighter =
await this.fighterRepository.findOne({

where:{
id:dto.blueCornerId
}

});


if(fighter){

fight.blueCorner = fighter;

}

}





if(dto.winnerId){


const fighter =
await this.fighterRepository.findOne({

where:{
id:dto.winnerId
}

});


if(fighter){

fight.winner = fighter;

}

}





Object.assign(
fight,
dto
);



return this.fightRepository.save(
fight
);

}








async remove(
id:number
){


const fight =
await this.findOne(id);



return this.fightRepository.remove(
fight
);

}



}