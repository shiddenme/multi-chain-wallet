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

class rawTransactionDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;
  @IsNotEmpty({ message: '地址为空' })
  to: string;
  @IsNotEmpty({ message: '转账值为空' })
  value: number;
  @IsNotEmpty({ message: '手续费值为空' })
  transactionFee: number;
  locktime?: number;
}

class findAssetDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;
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

  @Get('/asset')
  @UseFilters(new HttpExceptionFilter())
  async findAsset(@Query() query: findAssetDto) {
    return await this.transactionService.findAsset(query);
  }
}
