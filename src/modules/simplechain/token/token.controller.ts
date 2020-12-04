import {
    Controller,
    Get,
    Query
} from '@nestjs/common';

import { findTokenDto } from './dto/find_token.dto'
import { SipcTokenService } from './token.service'

@Controller('SIPC')
export class SipcTokenController {
    constructor(private readonly tokenService : SipcTokenService) {}

    @Get('/token')
    async findAll(@Query() query:findTokenDto) { 
       return await this.tokenService.findAll(query) 
    }
   
}

