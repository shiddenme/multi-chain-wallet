
const Web3 = require('web3');
const web3 = new Web3(
  new Web3.providers.HttpProvider('http://8.210.111.37:8545'),
);
(
  async () => {
    try {
      await web3.eth.net.isListening();
     } catch (e) { 
      console.log(e)
    }
    
   }
)()