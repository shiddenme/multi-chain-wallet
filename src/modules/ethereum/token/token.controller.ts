import { Controller, Get, Query, UseFilters } from '@nestjs/common';

import { EthTokenService } from './token.service';

import { HttpExceptionFilter } from '../../../core';

import { IsNotEmpty } from 'class-validator';
class findTokenDto {
  contract: string;
  symbol: string;
}

class findAssetDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;

  @IsNotEmpty({ message: '合约地址为空' })
  contracts: string;
}

@Controller('eth')
export class EthTokenController {
  constructor(private readonly tokenService: EthTokenService) {}

  @Get('/token')
  @UseFilters(new HttpExceptionFilter())
  async findAll(@Query() query: findTokenDto) {
    return await this.tokenService.findAll(query);
  }

  @Get('/asset')
  @UseFilters(new HttpExceptionFilter())
  async findAsset(@Query() query: findAssetDto) {
    return await this.tokenService.findAsset(query);
  }
}
