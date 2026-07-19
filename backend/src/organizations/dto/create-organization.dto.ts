import {
IsString,
IsOptional
} from 'class-validator';


export class CreateOrganizationDto {


@IsString()
name:string;



@IsString()
country:string;



@IsOptional()
@IsString()
logo?:string;



@IsOptional()
@IsString()
description?:string;


}