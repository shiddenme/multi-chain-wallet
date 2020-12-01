import { Injectable, Inject } from '@nestjs/common';
import { Block } from './block.entity';

@Injectable()
export class BlockService {
  constructor(
    @Inject('BLOCK_REPOSITORY') private readonly blockRepository: typeof Block) { }
  
  // todo: 为插入选项options 创建 DTO
  async findOne(options) { 
    return await this.blockRepository.findOne(options)
  }

  async findOrCreate(options) { 
    return await this.blockRepository.findOrCreate({
      where: { number: options.number},
      defaults: options 
    })
  }
}