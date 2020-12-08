import { Sequelize } from 'sequelize-typescript';
import * as ethBLocks from '../ethereum/block/block.entity';
import { Eth_Transaction } from '../ethereum/transaction/transaction.entity';
import { Eth_Uncle } from '../ethereum/uncle/uncle.entity';
import { Eth_Token } from '../ethereum/token/token.entity';

import * as sipcBLocks from '../simplechain/block/block.entity';
import { SIPC_Transaction } from '../simplechain/transaction/transaction.entity';
import { Sipc_Uncle } from '../simplechain/uncle/uncle.entity';
import { Sipc_Token } from '../simplechain/token/token.entity';
import { ConfigService } from '@nestjs/config';
import * as R from 'ramda';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async (config: ConfigService) => {
      console.log(config);
      const sequelize = new Sequelize({
        host: 'localhost',
        username: 'root',
        password: '123456',
        database: 'multi_chain_wallet',
        port: 3306,
        dialect: 'mysql',
      });
      sequelize.addModels(
        Object.values(
          R.mergeAll([
            ethBLocks,
            sipcBLocks,
            {
              Eth_Uncle,
              Eth_Token,
              Sipc_Uncle,
              Sipc_Token,
              Eth_Transaction,
              SIPC_Transaction,
            },
          ]),
        ),
      );
      await sequelize.sync({
        force: false,
      });
      return sequelize;
    },
  },
];
