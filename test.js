const Web3 = require('web3');
const web3 = new Web3(
  new Web3.providers.HttpProvider('http://8.210.111.37:8545'),
);
(
  async () => {
    console.log(await web3.eth.getCode('0xdac17f958d2ee523a2206206994597c13d831ec7'))
   }
)()