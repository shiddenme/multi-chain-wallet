import { Controller, UseFilters, Get, Query } from '@nestjs/common';

import { EthTransactionService } from './transaction.service';
import { HttpExceptionFilter } from '../../../core';
import { IsNotEmpty } from 'class-validator';

class findTransactionDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;
  @IsNotEmpty({ message: '代币名称为空' })
  name: string;
  search: string;
  pageIndex: number = 0;
  pageSize: number = 10;
}

class getTransferDto {
  @IsNotEmpty({ message: '转账地址为空' })
  to: string;

  @IsNotEmpty({ message: '转账数量为空' })
  value: string;
}

@Controller()
export class EthTransactionController {
  constructor(private readonly transactionService: EthTransactionService) {}

  @Get('eth/transaction')
  @UseFilters(new HttpExceptionFilter())
  async findAll(@Query() query: findTransactionDto) {
    return await this.transactionService.findAll(query);
  }

  @Get('eth/cross')
  @UseFilters(new HttpExceptionFilter())
  async findCross(@Query() query) {
    return await this.transactionService.findCross(query);
  }

  @Get('transfer')
  @UseFilters(new HttpExceptionFilter())
  async getTransfer(@Query() query: getTransferDto) {
    return await this.transactionService.getTransfer(query);
  }
}
