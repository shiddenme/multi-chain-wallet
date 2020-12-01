import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config'
import { Block } from '../block/block.entity'

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async (config: ConfigService) => {
      const sequelize = new Sequelize({
        host:'localhost',
        username:'root',
        password:'dataqin',
        database:'multi_chain_wallet',
        port:3306,
        dialect: 'mysql'
      });
      sequelize.addModels([Block]);
      await sequelize.sync({
        force: false
      });
      return sequelize;
    },
  },
];