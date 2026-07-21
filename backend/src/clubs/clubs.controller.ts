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
  Query
} from '@nestjs/common';

import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly clubsService: ClubsService
  ) {}

  @Post()
  create(
    @Body() createClubDto: CreateClubDto
  ) {
    return this.clubsService.create(
      createClubDto
    );
  }

  @Get()
  findAll(
    @Query('search') search?: string
  ) {
    return this.clubsService.findAll(
      search
    );
  }

  @Get(':id/fighters')
  findClubFighters(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.clubsService.findClubFighters(
      id
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.clubsService.findOne(
      id
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubDto: UpdateClubDto
  ) {
    return this.clubsService.update(
      id,
      updateClubDto
    );
  }

  @Post(':clubId/fighters/:fighterId')
  addFighter(
    @Param('clubId', ParseIntPipe)
    clubId: number,

    @Param('fighterId', ParseIntPipe)
    fighterId: number
  ) {
    return this.clubsService.addFighter(
      clubId,
      fighterId
    );
  }

  @Delete(':clubId/fighters/:fighterId')
  removeFighter(
    @Param('clubId', ParseIntPipe)
    clubId: number,

    @Param('fighterId', ParseIntPipe)
    fighterId: number
  ) {
    return this.clubsService.removeFighter(
      clubId,
      fighterId
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    await this.clubsService.remove(id);
  }
}