import {
  Controller,
  UseFilters,
  Get,
  Query,
  Logger,
  Param,
  Post,
  Body,
} from '@nestjs/common';

import { BtcTransactionService } from './transaction.service';
import { HttpExceptionFilter } from '../../../core';
import { IsNotEmpty } from 'class-validator';
import { rawTransactionInputs } from '../../../core/validate';

class findTransactionDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;
  pageIndex: string;
  pageSize: string;
}
class paramDto {
  @IsNotEmpty({ message: 'id不能为空' })
  txid: string;
}
type utxo = {
  txid: string;
  vout: number;
  Sequence?: number;
};
class rawTransactionDto {
  @IsNotEmpty({ message: '输入数组为空' })
  @rawTransactionInputs({ message: '输入数据格式错误' })
  inputs: utxo[];
  @IsNotEmpty({ message: '输出为空' })
  outputs: object;
  locktime: number;
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

  @Get('/transaction/:txid')
  @UseFilters(new HttpExceptionFilter())
  async getTransactionDetail(@Param() param: paramDto) {
    const { txid } = param;
    return await this.transactionService.getTransactionDetail(txid);
  }

  @Post('/transaction')
  @UseFilters(new HttpExceptionFilter())
  async createRawTransaction(@Body() body: rawTransactionDto) {
    return await this.transactionService.createRawTransaction(body);
  }
}
