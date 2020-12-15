import { Injectable, Inject } from '@nestjs/common';
import { eth_uncle } from './uncle.entity';

@Injectable()
export class EthUncleService {
  constructor(
    @Inject('eth_uncle_repo') private readonly uncleRepo: typeof eth_uncle,
  ) {}

  // todo: 为插入选项options 创建 DTO
  async findOne(options) {
    return await this.uncleRepo.findOne(options);
  }

  async findOrCreate(options) {
    return await this.uncleRepo.findOrCreate({
      where: { hash: options.hash },
      defaults: options,
      logging: false,
    });
  }
}
