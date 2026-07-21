import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { FightsService } from './fights.service';
import { CreateFightDto } from './dto/create-fight.dto';
import { UpdateFightDto } from './dto/update-fight.dto';

@Controller('fights')
export class FightsController {
  constructor(
    private readonly fightsService: FightsService,
  ) {}

  // POST /fights
  @Post()
  create(
    @Body() createFightDto: CreateFightDto,
  ) {
    return this.fightsService.create(
      createFightDto,
    );
  }

  // GET /fights
  @Get()
  findAll() {
    return this.fightsService.findAll();
  }

  // GET /fights/fighter/5
  @Get('fighter/:fighterId')
  findByFighter(
    @Param('fighterId', ParseIntPipe)
    fighterId: number,
  ) {
    return this.fightsService.findByFighter(
      fighterId,
    );
  }

  // GET /fights/event/3
  @Get('event/:eventId')
  findByEvent(
    @Param('eventId', ParseIntPipe)
    eventId: number,
  ) {
    return this.fightsService.findByEvent(
      eventId,
    );
  }

  // GET /fights/10
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fightsService.findOne(id);
  }

  // PATCH /fights/10
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateFightDto: UpdateFightDto,
  ) {
    return this.fightsService.update(
      id,
      updateFightDto,
    );
  }

  // DELETE /fights/10
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fightsService.remove(id);
  }
}