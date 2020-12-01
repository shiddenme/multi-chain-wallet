
import { Block,Block1 } from './block.entity';

export const BlockProviders = [
  {
    provide: 'BLOCK_REPOSITORY',
    useValue: Block,
  },
  {
    provide: 'BLOCK_REPOSITORY1',
    useValue: Block1,
  }
];