import { Sequelize } from 'sequelize-typescript';

import { eth_transaction } from '../ethereum/transaction/transaction.entity';
import { eth_token } from '../ethereum/token/token.entity';
import {
  sipc_transaction,
  slc_transaction,
} from '../simplechain/transaction/transaction.entity';
import { sipc_token } from '../simplechain/token/token.entity';
import { ConfigService } from '../../core';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const config = new ConfigService();
      const sequelize = new Sequelize(config.get('sequelize'));
      sequelize.addModels(
        Object.values([
          eth_token,
          sipc_token,
          eth_transaction,
          sipc_transaction,
          slc_transaction,
        ]),
      );
      await sequelize.sync({
        force: false,
        alter: false,
      });
      return sequelize;
    },
  },
];
