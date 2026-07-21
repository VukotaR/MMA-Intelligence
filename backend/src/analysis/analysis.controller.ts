import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { AnalysisService } from './analysis.service';

import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Analysis')
@ApiBearerAuth()
@Controller('analysis')
@UseGuards(
  JwtGuard,
  RolesGuard,
)
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
  ) {}

  @Post()
  @Roles(
    Role.ADMIN,
    Role.COACH,
  )
  @ApiOperation({
    summary: 'Create a coach analysis and game plan',
  })
  create(
    @Body() createAnalysisDto: CreateAnalysisDto,
  ) {
    return this.analysisService.create(
      createAnalysisDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all analyses',
  })
  findAll() {
    return this.analysisService.findAll();
  }

  @Get('matchup')
  @ApiOperation({
    summary:
      'Get analyses for a specific fighter matchup',
  })
  @ApiQuery({
    name: 'redFighterId',
    type: Number,
  })
  @ApiQuery({
    name: 'blueFighterId',
    type: Number,
  })
  findByFighters(
    @Query(
      'redFighterId',
      ParseIntPipe,
    )
    redFighterId: number,

    @Query(
      'blueFighterId',
      ParseIntPipe,
    )
    blueFighterId: number,
  ) {
    return this.analysisService.findByFighters(
      redFighterId,
      blueFighterId,
    );
  }

  @Get('coach/:coachId')
  @ApiOperation({
    summary: 'Get all analyses written by a coach',
  })
  findByCoach(
    @Param(
      'coachId',
      ParseIntPipe,
    )
    coachId: number,
  ) {
    return this.analysisService.findByCoach(
      coachId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one analysis',
  })
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.analysisService.findOne(id);
  }

  @Patch(':id')
  @Roles(
    Role.ADMIN,
    Role.COACH,
  )
  @ApiOperation({
    summary: 'Update an analysis or game plan',
  })
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateAnalysisDto: UpdateAnalysisDto,
  ) {
    return this.analysisService.update(
      id,
      updateAnalysisDto,
    );
  }

  @Delete(':id')
  @Roles(
    Role.ADMIN,
    Role.COACH,
  )
  @ApiOperation({
    summary: 'Delete an analysis',
  })
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.analysisService.remove(id);
  }
} 