import { Sequelize } from 'sequelize-typescript';
import * as ethBLocks from '../ethereum/block/block.entity';
import { Eth_Transaction } from '../ethereum/transaction/transaction.entity';
import { Eth_Uncle } from '../ethereum/uncle/uncle.entity';
import { Eth_Token } from '../ethereum/token/token.entity';

import * as sipcBLocks from '../simplechain/block/block.entity';
import { Sipc_Transaction } from '../simplechain/transaction/transaction.entity';
import { Sipc_Uncle } from '../simplechain/uncle/uncle.entity';
import { Sipc_Token } from '../simplechain/token/token.entity';
import { ConfigService } from '../../core';

import * as R from 'ramda';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const config = new ConfigService();
      const sequelize = new Sequelize(config.get('sequelize'));
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
              Sipc_Transaction,
            },
          ]),
        ),
      );
      await sequelize.sync({
        force: false,
        alter: false,
      });
      return sequelize;
    },
  },
];
