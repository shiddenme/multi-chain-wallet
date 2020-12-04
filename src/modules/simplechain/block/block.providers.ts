import * as SipcBlcoks from './block.entity';

export const SipcBlockProviders = Object.values(SipcBlcoks).map((ele, index) => {
    return {
      provide: `sipc_block_repo_${index + 1}`,
      useValue: ele
    }
})
