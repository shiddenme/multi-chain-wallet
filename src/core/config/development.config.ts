export default {
  sequelize: {
    host: 'localhost',
    username: 'root',
    password: '123456',
    database: 'multi_chain_wallet',
    port: 3306,
    dialect: 'mysql',
  },
  web3: {
    gethServer: 'http://8.210.111.37:8545',
    reconnect: 1000,
    sipcServer: 'https://explorer.simplechain.com/rpc',
  },
};
