import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { Role } from '../common/enums/role.enum';


@Controller('users')
export class UsersController {


  @Get('profile')
  @UseGuards(JwtGuard)
  profile(){

    return {
      message:"You are logged in"
    };

  }



  @Get('coach-test')
  @UseGuards(
    JwtGuard,
    RolesGuard
  )
  @Roles(Role.COACH)
  coachTest(){

    return {
      message:"Only coaches can see this"
    };

  }


}