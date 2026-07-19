import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UsersModule } from '../users/users.module';

import { JwtStrategy } from './strategies/jwt.strategy';  

import { RolesGuard } from './guards/roles.guard';


@Module({

imports:[

UsersModule,

JwtModule.register({

global:true,

secret:process.env.JWT_SECRET,

signOptions:{
expiresIn:'1d',
},

}),


],


controllers:[
AuthController,
],


providers:[
AuthService,
JwtStrategy,
RolesGuard,
],


})
export class AuthModule {}