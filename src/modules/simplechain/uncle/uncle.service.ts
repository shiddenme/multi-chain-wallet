import { Injectable, Inject } from '@nestjs/common';
import { Sipc_Uncle } from './uncle.entity';

@Injectable()
export class SipcUncleService {
  
  constructor(
    @Inject('sipc_uncle_repo') private readonly uncleRepo: typeof Sipc_Uncle,
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