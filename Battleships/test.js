
const Web3 = require('web3');

const web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://localhost:8546'), null, {});

web3.eth.getAccounts()
.then(console.log);