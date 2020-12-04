import {
    Controller,
    Req,
    Body,
    Post,
    UseGuards,
    Get,
    Query
} from '@nestjs/common';
import { findTransactionDto } from './dto/find.dto'

import { EthTransactionService } from './transaction.service'


@Controller()
export class EthTransactionController {
    constructor(private readonly transactionService : EthTransactionService) {}

    @Get('/transaction')
    async findAll(@Query() query:findTransactionDto) {    
        return await this.transactionService.findAll(query)
    }
   
}

