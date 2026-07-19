import {
Controller,
Get,
Post,
Body,
Param,
Delete,
ParseIntPipe
} from '@nestjs/common';


import { OrganizationsService } 
from './organizations.service';


import { CreateOrganizationDto }
from './dto/create-organization.dto';



@Controller('organizations')
export class OrganizationsController {


constructor(
private readonly service:OrganizationsService
){}



@Post()
create(
@Body() dto:CreateOrganizationDto
){

return this.service.create(dto);

}




@Get()
findAll(){

return this.service.findAll();

}



@Get(':id')
findOne(
@Param('id',ParseIntPipe)
id:number
){

return this.service.findOne(id);

}



@Delete(':id')
remove(
@Param('id',ParseIntPipe)
id:number
){

return this.service.remove(id);

}


}