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
    gethServer: 'http://192.168.4.147:8545',
    reconnect: 2000,
    sipcServer: 'https://explorer.simplechain.com/rpc',
    slcServer: 'http://101.68.74.171:8555',
    transferEvent:
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  },
  bitcoin: {
    main: 'http://192.168.4.148:8332',
    test: 'http://192.168.4.147:18332',
    header: {
      Authorization: 'Basic ' + 'dXNlcjoxMjM0NTY=',
      Connection: 'keep-alive',
      'Content-Type': 'application/json',
    },
    addressApi: 'blockchair.com',
    btc2usd: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    usd2cny: 'https://api.exchangerate-api.com/v4/latest/USD',
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },

  cross: {
    ehereum: {
      contractAddress: '0xB7F31CA6211cD8E4F72d85d95B70aFfE6421dE46',
      rpcServer: 'http://192.168.3.232:8555',
      crossServer: 'http://192.168.3.232:60004',
    },
    simplechain: {
      contractAddress: '0x1616A39BB53a9D2F5d7930E64a4F67beF0dc40B3',
      rpcServer: 'http://192.168.3.134:8545',
      crossServer: 'http://192.168.3.134:60001',
    },
  },
};
