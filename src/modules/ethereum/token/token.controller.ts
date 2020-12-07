import { Controller, Get, Query, UseFilters } from '@nestjs/common';

import { EthTokenService } from './token.service';

import { HttpExceptionFilter } from '../../../core';

class findTokenDto {
  contract: string;
  symbol: string;
}

@Controller('eth')
export class EthTokenController {
  constructor(private readonly tokenService: EthTokenService) {}

  @Get('/token')
  @UseFilters(new HttpExceptionFilter())
  async findAll(@Query() query: findTokenDto) {
    return await this.tokenService.findAll(query);
  }
}
