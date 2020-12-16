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
    reconnect: 5000,
    sipcServer: 'https://explorer.simplechain.com/rpc',
    slcServer: 'http://101.68.74.171:8555',
    transferEvent:
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  },
};
