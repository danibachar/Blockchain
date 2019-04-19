const {
    Blockchain,
    Block
} = require('./blockchain.js')

let micaCoin = new Blockchain();
micaCoin.addBlock(new Block(1, "20/01/2019", {
    amount: 4
}));
micaCoin.addBlock(new Block(2, "20/02/2019", {
    amount: 8
}));
console.log(JSON.stringify(micaCoin, null, 4));