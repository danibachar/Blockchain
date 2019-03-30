const {
    Blockchain,
    Block
} = require('./blockchain.1.js')

let micaCoin = new Blockchain();
micaCoin.addBlock(new Block(1, "20/01/2019", {
    amount: 4
}));
micaCoin.addBlock(new Block(2, "20/02/2019", {
    amount: 8
}));
console.log('Blockchain valid? ' + micaCoin.isChainValid());
console.log(JSON.stringify(micaCoin, null, 4));
micaCoin.chain[2].data = {
    amount: 100
};
console.log('Blockchain valid? ' + micaCoin.isChainValid());
micaCoin.chain[2].hash = micaCoin.chain[2].calculateHash();
console.log('Blockchain valid? ' + micaCoin.isChainValid());