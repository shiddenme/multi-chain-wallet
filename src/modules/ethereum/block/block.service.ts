import { Injectable, Inject } from '@nestjs/common';
import { Eth_Block_1, Eth_Block_2, Eth_Block_3 } from './block.entity';
import { whickBlockRepo } from '../../../shared/utils/tools';
import * as moment from 'moment';
@Injectable()
export class EthBlockService {
  constructor(
    @Inject('eth_block_repo_1') private readonly blockRepo1: typeof Eth_Block_1,
    @Inject('eth_block_repo_2') private readonly blockRepo2: typeof Eth_Block_2,
    @Inject('eth_block_repo_3') private readonly blockRepo3: typeof Eth_Block_3,
  ) {}
  private readonly repoList = [
    this.blockRepo1,
    this.blockRepo2,
    this.blockRepo3,
  ];

  // todo: 为插入选项options 创建 DTO
  async findOne(options, repo: typeof Eth_Block_1) {
    return await repo.findOne(options);
  }

  async findBlockTimeStamp(blcokNumber) {
    const index = whickBlockRepo(blcokNumber);
    const repo = this.repoList[index - 1];
    const time = await repo.findOne({
      where: {
        number: blcokNumber,
      },
      attributes: ['timestamp'],
      raw: true,
    });
    return time ? moment(time.timestamp * 1000).format('YYYY-MM-DD') : 0;
  }

  async findOrCreate(options) {
    const index = whickBlockRepo(options.number);
    const repo = this.repoList[index - 1];
    return await repo.findOrCreate({
      where: { number: options.number },
      defaults: options,
      logging: false,
    });
  }

  async findLargestBlockNumber() {
    for (let index = this.repoList.length - 1; index > -1; index--) {
      const element = this.repoList[index];
      const block = await this.findOne(
        {
          order: [['number', 'desc']],
          raw: true,
        },
        element,
      );
      if (block) {
        return block.number;
      }
    }
    return 0;
  }
}
