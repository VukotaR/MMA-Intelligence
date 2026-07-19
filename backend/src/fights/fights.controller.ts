import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';


import { FightsService } from './fights.service';

import { CreateFightDto } from './dto/create-fight.dto';

import { UpdateFightDto } from './dto/update-fight.dto';



@Controller('fights')
export class FightsController {


constructor(
private readonly fightsService:FightsService
){}



@Post()
create(
@Body()
dto:CreateFightDto
){

return this.fightsService.create(dto);

}





@Get()
findAll(){

return this.fightsService.findAll();

}





@Get(':id')
findOne(
@Param('id',ParseIntPipe)
id:number
){

return this.fightsService.findOne(id);

}





@Patch(':id')
update(

@Param('id',ParseIntPipe)
id:number,

@Body()
dto:UpdateFightDto

){

return this.fightsService.update(
id,
dto
);

}





@Delete(':id')
remove(
@Param('id',ParseIntPipe)
id:number
){

return this.fightsService.remove(id);

}


}