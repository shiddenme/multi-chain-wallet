import { Sequelize } from 'sequelize-typescript';
import * as ethBLocks from '../ethereum/block/block.entity'
import * as ethTransactions from '../ethereum/transaction/transaction.entity'
import { Eth_Uncle } from '../ethereum/uncle/uncle.entity'
import { Eth_Token } from '../ethereum/token/token.entity'
import { Eth_Wallet_Token } from '../ethereum/walletToken/walletToken.entity'
import * as R from 'ramda'
export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        host:'localhost',
        username:'root',
        password:'dataqin',
        database:'multi_chain_wallet',
        port:3306,
        dialect: 'mysql'
      }); 
      sequelize.addModels(Object.values(R.mergeAll([ethBLocks, ethTransactions, {
        Eth_Uncle, Eth_Token, Eth_Wallet_Token
      }])));
      await sequelize.sync({
        force: false
      });
      return sequelize;
    },
  },
];