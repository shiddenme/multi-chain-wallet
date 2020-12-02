import {
    Controller,
    Req,
    Body,
    Post,
    UseGuards,
    Get,
    Param,
    ParseIntPipe,
    Delete,
    Put,
    Query
} from '@nestjs/common';


import { EthTokenService } from './token.service'

@Controller('token')
export class EthTokenController {
    constructor(private readonly tokenService : EthTokenService) {}

    @Get()
    async findAll(@Query() query) { 
        console.log(query)
       return await this.tokenService.findAll(query) 
    }
   
}

