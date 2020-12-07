import { Controller, Get, Query, UseFilters } from '@nestjs/common';

import { SipcTokenService } from './token.service';

import { HttpExceptionFilter } from '../../../core';

class findTokenDto {
  contract: string;
  symbol: string;
}

@Controller('sipc')
export class SipcTokenController {
  constructor(private readonly tokenService: SipcTokenService) {}

  @Get('token')
  @UseFilters(new HttpExceptionFilter())
  async findAll(@Query() query: findTokenDto) {
    return await this.tokenService.findAll(query);
  }
}
