
const mysql = require('mysql2');
const connnect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'multi_chain_wallet'
})

const tokens = require('./eth_token')
function spider() { 

    tokens.forEach((token) =>{ 
        const {contract,symbol,icon,name,price,sort } = token;
        connnect.execute(`replace into Eth_Token(contract,symbol,icon,name,sort,price) 
        values('${contract}','${symbol}','${icon}','${name}',${sort},${price})`, function (err,res) { 
                if (!err) {
                    console.log('success',sort)
                } else { 
                    console.log(err)
                }
        })
        
    })
}
spider()
