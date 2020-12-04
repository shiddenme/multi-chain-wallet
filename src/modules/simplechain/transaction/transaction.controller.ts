import {
    Controller,
    UseFilters,
    Get,
    Query,
    BadRequestException
} from '@nestjs/common';
import { findTransactionDto } from './dto/find.dto'

import { SipcTransactionService } from './transaction.service'
import { HttpExceptionFilter } from '../../../core'

@Controller('SIPC')
export class SipcTransactionController {
    constructor(private readonly transactionService : SipcTransactionService) {}

    @Get('/transaction')
    @UseFilters(new HttpExceptionFilter())
    async findAll(@Query() query: findTransactionDto) {   
        return await this.transactionService.findAll(query)
    }
   
}

