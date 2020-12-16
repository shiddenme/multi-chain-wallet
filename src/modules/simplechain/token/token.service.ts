import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { sipc_token } from './token.entity';
import { Web3Service } from '../../../shared/services/web3.service';
import * as R from 'ramda';
import { Op } from 'sequelize';

import { ConfigService } from '../../../core';
class findTokenDto {
  search: string;
  pageIndex: number;
  pageSize: number;
}

@Injectable()
export class SipcTokenService {
  constructor(
    @Inject('sipc_token_repo') private readonly tokenRepo: typeof sipc_token,
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
    private readonly config: ConfigService,
  ) {}

  async findAll(where: findTokenDto) {
    let options: any;
    const { search = '', pageIndex = 1, pageSize = 10 } = where;
    const limit = Number(pageSize);
    const offset = pageIndex < 1 ? 0 : Number(pageIndex - 1) * Number(pageSize);
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
    const res = await this.tokenRepo.findAndCountAll({
      where: options,
      limit,
      offset,
      order: [['sort', 'asc']],
      raw: true,
    });
    return {
      tokens: res.rows,
      count: res.count,
    };
  }

  async findOne(where) {
    return await this.tokenRepo.findOne({
      where: R.pick(['contract', 'symbol', 'name'])(where),
      raw: true,
    });
  }

  async findAsset(where) {
    const { wallet, names } = where;
    const res = await this.tokenRepo.findAll({
      where: {},
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
        const gasPrice = await this.web3Service.getGasPrice(false);
        const decimals = await this.web3Service.getDecimals(contract, false);
        return R.mergeRight(token, {
          balance,
          gasPrice,
          decimals,
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
