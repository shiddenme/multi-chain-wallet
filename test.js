const Web3 = require('web3');
const web3 = new Web3(
    new Web3.providers.HttpProvider('http://8.210.111.37:8545'),
  );
console.log(web3.eth.accounts.privateKeyToAccount('0xa963a079302bdce6033eee5a5f5b29ff201cd869e7f7b3aad7224bc0acb0e1fa'))