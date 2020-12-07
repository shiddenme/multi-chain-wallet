import { Injectable, Inject } from '@nestjs/common';
import { Eth_Asset } from './asset.entity';

import { EthTokenService } from '../token/token.service';
@Injectable()
export class EthAssetService {
  constructor(
    @Inject('eth_wallet_token_repo')
    private readonly assetRepo: typeof Eth_Asset,
    private readonly tokenService: EthTokenService,
  ) {}

  // todo: 为插入选项options 创建 DTO
  async findAll(where) {
    const wallet = where.wallet;
    const tokens = await this.assetRepo.findAll({
      where: {
        wallet,
      },
      raw: true,
    });
    const data = await Promise.all(
      tokens.map(async (ele) => {
        return await this.tokenService.findOne({
          contract: ele.contract,
        });
      }),
    );
    return {
      wallet,
      tokens: data,
    };
  }

  async post(options) {
    const res = await this.assetRepo.create(options);
    return res;
  }
}
