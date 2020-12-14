const Web3 = require('web3');
const web3 = new Web3(
  new Web3.providers.HttpProvider('http://8.210.111.37:8545'),
);
console.log(
  web3.eth.abi.decodeParameters(
    [{
      type: 'address',
      name: 'to'
  },{
      type: 'uint256',
      name: 'value'
  }],
    '0x00000000000000000000000094c98c8e336bae512bb648a6b560b50711b11e1f00000000000000000000000000000000000000000000000000000000000186a0',
  ),
);
