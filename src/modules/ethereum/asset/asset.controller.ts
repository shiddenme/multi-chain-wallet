import {
  Controller,
  Req,
  Body,
  Post,
  UseFilters,
  Get,
  Query,
} from '@nestjs/common';
import { EthAssetService } from './asset.service';
import { HttpExceptionFilter } from '../../../core';
import { IsNotEmpty } from 'class-validator';

class findDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;
}

class createDto {
  @IsNotEmpty({ message: '钱包地址为空' })
  wallet: string;

  @IsNotEmpty({ message: '合约地址为空' })
  contract: string;
}

@Controller('eth')
export class EthAssertController {
  constructor(private readonly assetService: EthAssetService) {}

  @Get('/asset')
  @UseFilters(new HttpExceptionFilter())
  async findAll(@Query() query: findDto) {
    return await this.assetService.findAll(query);
  }

  @Post('/asset')
  @UseFilters(new HttpExceptionFilter())
  async post(@Body() body: createDto) {
    return await this.assetService.post(body);
  }
}
