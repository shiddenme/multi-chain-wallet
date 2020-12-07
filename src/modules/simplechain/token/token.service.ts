import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Sipc_Token } from './token.entity';
import { Web3Service } from '../../../shared/services/web3.service';
import * as R from 'ramda';

@Injectable()
export class SipcTokenService {
  constructor(
    @Inject('sipc_token_repo') private readonly tokenRepo: typeof Sipc_Token,
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
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

  async findAsset(where) {
    const { wallet, contracts } = where;
    const tokens = await Promise.all(
      contracts.split(',').map(async (contract) => {
        const token = await this.findOne({ contract });
        const balance = await this.web3Service.myBalanceOf(
          contract,
          wallet,
          false,
        );
        return R.mergeRight(token, {
          balance,
        });
      }),
    );
    return {
      wallet,
      tokens,
    };
  }
}
