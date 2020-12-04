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

import { findTokenDto } from './dto/find_token.dto'
import { EthTokenService } from './token.service'

@Controller()
export class EthTokenController {
    constructor(private readonly tokenService : EthTokenService) {}

    @Get('/token')
    async findAll(@Query() query:findTokenDto) { 
       return await this.tokenService.findAll(query) 
    }
   
}

