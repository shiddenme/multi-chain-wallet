import {
    Controller,
    Req,
    Body,
    Post,
    UseGuards,
    Get,
    Query
} from '@nestjs/common';
import { walletTokenDto, findWalletTokenDto } from './dto'

import { SipcWalletTokenService } from './walletToken.service'


@Controller('SIPC')
export class SipcWalletTokenController {
    constructor(private readonly walletTokenService : SipcWalletTokenService) {}

    @Get('/wallet/token')
    async findAll(@Query() query: findWalletTokenDto) { 
       return await this.walletTokenService.findAll(query) 
    }

    @Post('/wallet/token')
    async post(@Body() body: walletTokenDto) { 
        return await this.walletTokenService.post(body);
    }
   
}

