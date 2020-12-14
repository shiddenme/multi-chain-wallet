import { Controller, Get, Query, UseFilters } from '@nestjs/common';

import { SipcTokenService } from './token.service';

import { HttpExceptionFilter } from '../../../core';

import { IsNotEmpty } from 'class-validator';
class findTokenDto {
  search: string;
  pageIndex: number;
  pageSize: number;
}

class findAssetDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;

  @IsNotEmpty({ message: '名称为空' })
  names: string;
}

@Controller('sipc')
export class SipcTokenController {
  constructor(private readonly tokenService: SipcTokenService) {}

  @Get('token')
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
