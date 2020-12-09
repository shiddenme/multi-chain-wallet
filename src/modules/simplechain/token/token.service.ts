import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Sipc_Token } from './token.entity';
import { Web3Service } from '../../../shared/services/web3.service';
import * as R from 'ramda';
import { Op } from 'sequelize';

import { ConfigService } from '../../../core';
class findTokenDto {
  search: string;
}

@Injectable()
export class SipcTokenService {
  constructor(
    @Inject('sipc_token_repo') private readonly tokenRepo: typeof Sipc_Token,
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
    private readonly config: ConfigService,
  ) {}

  async findAll(where: findTokenDto) {
    let options: any;
    const { search = '' } = where;
    if (!search) {
      options = {};
    } else if (/^0x/.test(search)) {
      options = {
        contract: search,
      };
    } else {
      options = {
        symbol: {
          [Op.like]: `${search.toUpperCase()}%`,
        },
      };
    }
    const tokens = await this.tokenRepo.findAll({
      where: options,
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
    const { wallet, names } = where;
    const res = await this.tokenRepo.findAll({
      where: {
        name: {
          [Op.in]: ['SimpleChain'].concat(names.split(',')),
        },
      },
      raw: true,
      order: [['sort', 'asc']],
    });

    const tokens = await Promise.all(
      res.map(async (token) => {
        const { contract } = token;
        const balance = await this.web3Service.myBalanceOf(
          contract,
          wallet,
          false,
        );
        return R.mergeRight(token, {
          balance,
          server: this.config.get('web3')['sipcServer'],
        });
      }),
    );

    return {
      wallet,
      tokens,
    };
  }
}
