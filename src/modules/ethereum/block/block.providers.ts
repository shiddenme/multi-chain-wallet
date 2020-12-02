import * as ethBlcoks from './block.entity';

export const EthBlockProviders = Object.values(ethBlcoks).map((ele, index) => {
    return {
      provide: `eth_block_repo_${index + 1}`,
      useValue: ele
    }
})
