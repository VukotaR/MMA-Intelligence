import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import { FightersService } from './fighters.service';

import { CreateFighterDto } from './dto/create-fighter.dto';
import { UpdateFighterDto } from './dto/update-fighter.dto';

@Controller('fighters')
export class FightersController {
  constructor(
    private readonly fightersService: FightersService,
  ) {}

  @Post()
  create(@Body() dto: CreateFighterDto) {
    return this.fightersService.create(dto);
  }

  @Get()
  findAll(
    @Query('search')
    search?: string,
  ) {
    return this.fightersService.findAll(search);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fightersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateFighterDto,
  ) {
    return this.fightersService.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fightersService.remove(id);
  }
}