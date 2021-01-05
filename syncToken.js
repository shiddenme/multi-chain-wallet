const R = require('ramda')
const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'multi_chain_wallet'
})
const promisePool = pool.promise();

async function createTransactionTable() {
    const tokens = await promisePool.query(`select sort,contract from eth_token`);
    await Promise.all(tokens[0].map(async ele => { 
        const { sort } = ele;
        console.log('sort =',sort)
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
            KEY from_timestamp (\`from\`,\`timestamp\`),
            KEY to_timestamp (\`to\`,\`timestamp\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
        await promisePool.query(sql)
    }))
    promisePool.end()
}
async function  updateToken() {
    const json = {};
    json.introduce = ''
    json.projectName = ''
    json.officialWebsite = ''
    json.contractAddress = ''
    json.tripartiteRating = ''
    json.publishTime = ''
    json.totalIssuance = ''
    const sql = `update eth_token set details = '${JSON.stringify(json)}' where sort = 5`;
    console.log('sql =', sql);
    await promisePool.query(sql)
    await  promisePool.end()
}
updateToken()