const {
    Blockchain,
    Block,
    Transaction
} = require('./Blockchain.3.js')

let micaCoin = new Blockchain();
micaCoin.createTransaction(new Transaction('address1', 'address2', 100));
micaCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
micaCoin.minePendingTransactions('Bob-address');

console.log('\nBalance of Bob is', micaCoin.getBalanceOfAddress('Bob-address'));

console.log('\n Starting the miner again...');
micaCoin.minePendingTransactions('Bob-address');

console.log('\nBalance of Bob is', micaCoin.getBalanceOfAddress('Bob-address'));