import { Injectable, Inject } from '@nestjs/common';
import { eth_block_1, eth_block_2, eth_block_3 } from './block.entity';
import { whickBlockRepo } from '../../../shared/utils/tools';

@Injectable()
export class EthBlockService {
  constructor(
    @Inject('eth_block_repo_1') private readonly blockRepo1: typeof eth_block_1,
    @Inject('eth_block_repo_2') private readonly blockRepo2: typeof eth_block_2,
    @Inject('eth_block_repo_3') private readonly blockRepo3: typeof eth_block_3,
  ) {}
  private readonly repoList = [
    this.blockRepo1,
    this.blockRepo2,
    this.blockRepo3,
  ];

  // todo: 为插入选项options 创建 DTO
  async findOne(options, repo: typeof eth_block_1) {
    return await repo.findOne(options);
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
