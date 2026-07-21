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
  Query,
  Req,
  UseGuards
} from '@nestjs/common';

import { Request } from 'express';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { Role } from '../common/enums/role.enum';

import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: Role;
  };
}

@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly clubsService: ClubsService
  ) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body() createClubDto: CreateClubDto
  ) {
    return this.clubsService.create(createClubDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string
  ) {
    return this.clubsService.findAll(search);
  }

  @Get('my')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.COACH)
  findMyClub(
    @Req() request: AuthenticatedRequest
  ) {
    return this.clubsService.findByCoachId(
      request.user.id
    );
  }

  @Get(':id/fighters')
  findClubFighters(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.clubsService.findClubFighters(id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.clubsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COACH)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubDto: UpdateClubDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.clubsService.update(
      id,
      updateClubDto,
      request.user
    );
  }

  @Post(':clubId/fighters/:fighterId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COACH)
  removeFighter(
    @Param('clubId', ParseIntPipe)
    clubId: number,

    @Param('fighterId', ParseIntPipe)
    fighterId: number,

    @Req() request: AuthenticatedRequest
  ) {
    return this.clubsService.removeFighter(
      clubId,
      fighterId,
      request.user
    );
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    await this.clubsService.remove(id);
  }
}