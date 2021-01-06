import { Controller, UseFilters, Get, Query } from '@nestjs/common';

import { EthCrossService } from './cross.service';
import { HttpExceptionFilter } from '../../core';
import { IsNotEmpty } from 'class-validator';
class makeCrossTxnDto {
  @IsNotEmpty()
  crossChainId: number;
  @IsNotEmpty()
  destValue: number;
  @IsNotEmpty()
  from: string;
  to: string;
  input: string;
  type: string;
}

class takeCrossTxnDto {
  @IsNotEmpty()
  crossChainId: number;
  @IsNotEmpty()
  to: string;
  input: string;
  type: string;
}
@Controller('eth')
export class EthCrossController {
  constructor(private readonly crossService: EthCrossService) {}

  @Get('crossTxn/make')
  @UseFilters(new HttpExceptionFilter())
  async makeCrossTxn(@Query() query: makeCrossTxnDto) {
    query.type = 'make';
    return await this.crossService.crossTxn(query);
  }

  @Get('crossTxn/take')
  @UseFilters(new HttpExceptionFilter())
  async takeCrossTxn(@Query() query: takeCrossTxnDto) {
    query.type = 'take';
    return await this.crossService.crossTxn(query);
  }
}
