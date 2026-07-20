import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { FightsService } from './fights.service';

@Controller('fights')
export class FightsController {
  constructor(
    private readonly fightsService: FightsService,
  ) {}

  @Get()
  findAll() {
    return this.fightsService.findAll();
  }

  @Get('fighter/:fighterId')
  findByFighter(
    @Param('fighterId', ParseIntPipe)
    fighterId: number,
  ) {
    return this.fightsService.findByFighter(
      fighterId,
    );
  }

  @Get('event/:eventId')
  findByEvent(
    @Param('eventId', ParseIntPipe)
    eventId: number,
  ) {
    return this.fightsService.findByEvent(eventId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fightsService.findOne(id);
  }
}