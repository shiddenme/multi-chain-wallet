import { Injectable, Inject } from '@nestjs/common';
import { Eth_Uncle } from './uncle.entity';

@Injectable()
export class EthUncleService {
  
  constructor(
    @Inject('eth_uncle_repo') private readonly uncleRepo: typeof Eth_Uncle,
  ) { }

  // todo: 为插入选项options 创建 DTO
  async findOne(options) { 

    return await this.uncleRepo.findOne(options)
  }

  async findOrCreate(options) { 
    return await this.uncleRepo.findOrCreate({
      where: { hash: options.hash },
      defaults: options,
      logging:false
    })
  }
}