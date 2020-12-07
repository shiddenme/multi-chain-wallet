import { Injectable, Inject } from '@nestjs/common';
import { Sipc_Token } from './token.entity';
import { SipcTransactionService } from '../transaction/transaction.service';
import * as R from 'ramda';

@Injectable()
export class SipcTokenService {
  constructor(
    @Inject('sipc_token_repo') private readonly tokenRepo: typeof Sipc_Token,
    private readonly transactionService: SipcTransactionService,
  ) {}

  async findAll(where) {
    const tokens = await this.tokenRepo.findAll({
      where: R.pick(['contract', 'symbol'])(where),
      limit: 10,
      order: [['sort', 'asc']],
      raw: true,
    });
    return {
      tokens,
    };
  }

  async findOne(where) {
    return await this.tokenRepo.findOne({
      where: R.pick(['contract', 'symbol'])(where),
      raw: true,
    });
  }
}
