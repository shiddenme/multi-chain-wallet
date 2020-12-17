const R = require('ramda')
const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'multi_chain_wallet'
})
const promisePool = pool.promise();

async function spider() {
    await promisePool.query(`insert into eth_token values
    ('0x','ETH','http://8.210.111.37:3001/ethereum/images/ehereum-icon.png','Ethereum',6354.00,0),
    ('0xdac17f958d2ee523a2206206994597c13d831ec7','USDT','http://8.210.111.37:3001/ethereum/images/tether_32.png','TetherUSD',6.54,1),
    ('0x514910771af9ca656af840dff83e8264ecf986ca','LINK','http://8.210.111.37:3001/ethereum/images/chainlink_28_2.png','ChainLinkToken',83.69,2),
    ('0xB8c77482e45F1F44dE1745F52C74426C631bDD52','BNB','http://8.210.111.37:3001/ethereum/images/bnb_28_2.png','BNB',190.40,3),
    ('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48','USDC','http://8.210.111.37:3001/ethereum/images/centre-usdc_28.png','USDCoin',6.54,4),
    ('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599','WBTC','http://8.210.111.37:3001/ethereum/images/wbtc_28.png','WrappedBTC',125015.53,5),
    ('0x75231f58b43240c9718dd58b4967c5114342a86c','OKB','http://8.210.111.37:3001/ethereum/images/okex_28.png','OKB',36.88,6),
    ('0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643','cDAI','http://8.210.111.37:3001/ethereum/images/compounddai_32.png','CompoundDai',0.14,7)
    `)
    await promisePool.query(`insert into sipc_token values
    ('','SIPC','','Simplechain',1.62,0),
    ('0x','SLC','https://sipc-p.oss-cn-hangzhou.aliyuncs.com/sipc_apk/wallet_icon_slc.png','Starlink',5.94,1),
    ('0x87912356cc237a4c4ed33c694d0d66f2eb0d3e5d','FBI','hangzhou.aliyuncs.com/sipc_apk/wallet_icon_fbi.png','FBI',1.50,2)
    `)
    const tokens = await promisePool.query(`select sort,contract from eth_token`);
    await Promise.all(tokens[0].map(async ele => { 
        const { sort } = ele;
        const tableName = `eth_transaction_${sort}`;
        const sql = `CREATE TABLE \`${ tableName}\` (
            \`blockHash\` varbinary(128) DEFAULT NULL,
            \`blockNumber\` int DEFAULT NULL,
            \`hash\` varbinary(128) NOT NULL,
            \`from\` varchar(64) DEFAULT NULL,
            \`gas\` bigint DEFAULT NULL,
            \`gasUsed\` bigint DEFAULT NULL,
            \`gasPrice\` bigint DEFAULT NULL,
            \`input\` varbinary(50000) DEFAULT NULL,
            \`nonce\` bigint DEFAULT NULL,
            \`to\` varchar(64) DEFAULT NULL,
            \`transactionIndex\` smallint DEFAULT NULL,
            \`value\` varbinary(32) DEFAULT NULL,
            \`contract\` varchar(64) DEFAULT NULL,
            \`timestamp\` bigint DEFAULT NULL,
            \`status\` tinyint(1) DEFAULT NULL,
            PRIMARY KEY (\`hash\`),
            KEY \`blockNumber\` (\`blockNumber\`),
            KEY \`from\` (\`from\`),
            KEY \`to\` (\`to\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
        await promisePool.query(sql)
    }))
    promisePool.end()
}
spider()
