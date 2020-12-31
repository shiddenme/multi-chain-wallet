import { Controller, UseFilters, Get, Query, Logger } from '@nestjs/common';

import { BtcTransactionService } from './transaction.service';
import { HttpExceptionFilter } from '../../../core';
import { IsNotEmpty } from 'class-validator';

class findTransactionDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;
  pageIndex: string;
  pageSize: string;
}

@Controller('btc')
export class BtcTransactionController {
  private readonly logger = new Logger(BtcTransactionController.name);
  constructor(private readonly transactionService: BtcTransactionService) {}

  @Get('/transaction')
  @UseFilters(new HttpExceptionFilter())
  async findAll(@Query() query: findTransactionDto) {
    return await this.transactionService.getTransactionByAddress(query);
  }

  @Get('/network')
  @UseFilters(new HttpExceptionFilter())
  async getNetWork() {
    const currentNetwork = global.activeBlockchain;
    global.activeBlockchain = currentNetwork === 'main' ? 'test' : 'main';
    this.logger.debug(`change network to ${global.activeBlockchain}`);
    return {
      currentNetwork: global.activeBlockchain,
    };
  }
}
