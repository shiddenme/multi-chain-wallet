const Web3 = require('web3');
const web3 = new Web3(
  new Web3.providers.HttpProvider('http://8.210.111.37:8545'),
);
console.log(web3.eth.accounts.privateKeyToAccount('0x5eee27fc11dcf941e19e5f79bdf55b9e53c7a8a5953ff589efb90e87591625d1'))