import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { Eth_Token } from './token.entity';
import { ConfigService } from '../../../core';
import * as R from 'ramda';
import { Web3Service } from '../../../shared/services/web3.service';
import { Op } from 'sequelize';
import { fromWei } from '../../../shared/utils/tools';

@Injectable()
export class EthTokenService {
  constructor(
    @Inject('eth_token_repo') private readonly tokenRepo: typeof Eth_Token,
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
    private readonly config: ConfigService,
  ) {}

  async findAll(where) {
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
          [Op.in]: ['ether'].concat(names.split(',')),
        },
      },
      raw: true,
      order: [['sort', 'asc']],
    });

    const tokens = await Promise.all(
      res.map(async (token) => {
        const { contract } = token;
        const balance = await this.web3Service.myBalanceOf(contract, wallet);
        return R.mergeRight(token, {
          balance,
          server: this.config.get('web3')['gethServer'],
        });
      }),
    );
    return {
      wallet,
      tokens,
    };
  }
}
