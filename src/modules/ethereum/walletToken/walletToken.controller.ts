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

import { EthWalletTokenService } from './walletToken.service'


@Controller()
export class EthWalletTokenController {
    constructor(private readonly walletTokenService : EthWalletTokenService) {}

    @Get('/wallet/token')
    async findAll(@Query() query: findWalletTokenDto) { 
       return await this.walletTokenService.findAll(query) 
    }

    @Post('/wallet/token')
    async post(@Body() body: walletTokenDto) { 
        return await this.walletTokenService.post(body);
    }
   
}

