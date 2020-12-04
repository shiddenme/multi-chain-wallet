import {
    Controller,
    UseFilters,
    Get,
    Query
} from '@nestjs/common';
import { findTransactionDto } from './dto/find.dto'

import { EthTransactionService } from './transaction.service'
import { HttpExceptionFilter } from '../../../core'

@Controller('ETH')
export class EthTransactionController {
    constructor(private readonly transactionService : EthTransactionService) {}

    @Get('/transaction')
    @UseFilters(new HttpExceptionFilter())
    async findAll(@Query() query: findTransactionDto) {   
        return await this.transactionService.findAll(query)
    }
   
}

