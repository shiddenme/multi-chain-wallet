import { Controller, UseFilters, Get, Query } from '@nestjs/common';

import { SipcTransactionService } from './transaction.service';
import { HttpExceptionFilter } from '../../../core';
import { IsNotEmpty } from 'class-validator';

class findTransactionDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;
  @IsNotEmpty({ message: '代币名称为空' })
  name: string;
  search: string;
  pageIndex: number;
  pageSize: number;
}
@Controller('sipc')
export class SipcTransactionController {
  constructor(private readonly transactionService: SipcTransactionService) {}

  @Get('/transaction')
  @UseFilters(new HttpExceptionFilter())
  async findAll(@Query() query: findTransactionDto) {
    return await this.transactionService.findAll(query);
  }
}
