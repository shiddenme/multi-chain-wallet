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
    gethServer: 'http://127.0.0.1:8545',
    reconnect: 2000,
    sipcServer: 'https://explorer.simplechain.com/rpc',
    slcServer: 'http://101.68.74.171:8555',
    transferEvent:
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  },
  bitcoin: {
    main: 'http://192.168.4.148:8332',
    test: 'http://127.0.0.1:18332',
    header: {
      Authorization: 'Basic ' + 'dXNlcjoxMjM0NTY=',
      Connection: 'keep-alive',
      'Content-Type': 'application/json',
    },
    addressApi: 'blockchair.com',
  },
};
