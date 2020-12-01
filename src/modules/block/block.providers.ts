
import { Block } from './block.entity';

export const BlockProviders = [
  {
    provide: 'BLOCK_REPOSITORY',
    useValue: Block,
  }
];