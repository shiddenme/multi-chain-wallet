import { Injectable, Inject } from '@nestjs/common';
import { Block } from './block.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class BlockService {
  constructor(
    @Inject('BLOCK_REPOSITORY') private readonly blockRepository: typeof Block,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize) { }
  
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