import { Injectable, Inject } from '@nestjs/common';
import { Sipc_Asset } from './asset.entity';
import { SipcTokenService } from '../token/token.service';
@Injectable()
export class SipcAssetService {
  constructor(
    @Inject('sipc_wallet_token_repo')
    private readonly wallerTokenRepo: typeof Sipc_Asset,
    private readonly tokenService: SipcTokenService,
  ) {}

  // todo: 为插入选项options 创建 DTO
  async findAll(where) {
    const wallet = where.wallet;
    const tokens = await this.wallerTokenRepo.findAll({
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
    const res = await this.wallerTokenRepo.create(options);
    return res;
  }
}
