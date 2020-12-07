import { Sequelize } from 'sequelize-typescript';
import * as ethBLocks from '../ethereum/block/block.entity';
import * as ethTransactions from '../ethereum/transaction/transaction.entity';
import { Eth_Uncle } from '../ethereum/uncle/uncle.entity';
import { Eth_Token } from '../ethereum/token/token.entity';
import { Eth_Asset } from '../ethereum/asset/asset.entity';

import * as sipcBLocks from '../simplechain/block/block.entity';
import * as sipcTransactions from '../simplechain/transaction/transaction.entity';
import { Sipc_Uncle } from '../simplechain/uncle/uncle.entity';
import { Sipc_Token } from '../simplechain/token/token.entity';
import { Sipc_Asset } from '../simplechain/asset/asset.entity';
import * as R from 'ramda';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        host: 'localhost',
        username: 'root',
        password: 'dataqin',
        database: 'multi_chain_wallet',
        port: 3306,
        dialect: 'mysql',
      });
      sequelize.addModels(
        Object.values(
          R.mergeAll([
            ethBLocks,
            ethTransactions,
            sipcBLocks,
            sipcTransactions,
            {
              Eth_Uncle,
              Eth_Token,
              Eth_Asset,
              Sipc_Uncle,
              Sipc_Token,
              Sipc_Asset,
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
