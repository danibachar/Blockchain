const topology = require('fully-connected-topology')
const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const {
    stdin,
    exit,
    argv
} = process
const {
    log
} = console
const {
    me,
    peers
} = extractPeersAndMyPort()

const sockets = {}

class Node {
  /**
  * @param {string} port // port
   * @param {string} netAddress // ip+port
   * @param {string} priavteKey // private key
   * @param {string} publicKey // Wallet address, for receiving transaations
   */
   //'7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf'
  constructor(port, hash) {
    // Create new instance of Blockchain class
    this.nekoCoin = new Blockchain();
    this.port = port
    this.netAddress = toLocalIp(port, hash);
    this.privateKey = ec.keyFromPrivate(hash);
    this.publicKey = this.privateKey.getPublic('hex');

  }
}
// TODO: - understand this hash meaning
const hash = '7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995c'
const FullNode = new Node(me, hash+'f')
const Peers = peers.map(peer => new Node(peer, hash+Math.floor(Math.random() * 10).toString()))

const P2PNodes = [FullNode].concat(Peers)

topology(FullNode.netAddress, Peers.map(p => p.netAddress)).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    log('connected to peer - ', peerPort)
    sockets[peerPort] = socket
    stdin.on('data', data => { //on user input
        const message = data.toString().trim()
        if (message === 'exit') { //on exit
            log('Bye bye')
            exit(0)
        }
        const receiverPeer = extractReceiverPeer(message)
        const msg = formatMessage(message)
        //broadcast message to everyone
        socket.write(msg)
    })
    //print data when received
    socket.on('data', data => {
      const msg = data.toString('utf8')
      const transaction = extractTransationData({msg})
      startTransaction({transaction})
    })
})

function startTransaction({ transaction }) {
  //Find details
  const fromNode = P2PNodes.find(node => {
    return node.port === transaction.from
  });
  const toNode = P2PNodes.find(node => {
    return node.port === transaction.to
  });
  if (fromNode === undefined || toNode === undefined) {
    throw Error("Could not find nodes")
  }

  const element = ['transfering', transaction.amount, 'from', transaction.from, 'to', transaction.to]
  log(element.join(' '))

  // Create  transaction
  const t = new Transaction(fromNode.publicKey, toNode.publicKey, transaction.amount);
  t.signTransaction(fromNode.privateKey);
  nekoCoin.addTransaction(t);
  // Mine block
  nekoCoin.minePendingTransactions(fromNode.publicKey);
}

function extractTransationData({ msg }) {
  const transactionData = msg.split(/[\s:>]+/)
  //Validate
  if (transactionData.length != 3) {
    throw Error('Melfromed transaction data');
  }
  return {
    from: transactionData[0],
    to: transactionData[1],
    amount: transactionData[2],
  }
}
//extract ports from process arguments, {me: first_port, peers: rest... }
function extractPeersAndMyPort() {
    return {
        me: argv[2],
        peers: argv.slice(3, argv.length)
    }
}
//'4000' -> '127.0.0.1:4000'
function toLocalIp(port) {
    return '127.0.0.1:' + port
}
//['4000', '4001'] -> ['127.0.0.1:4000', '127.0.0.1:4001']
function getPeerIps(peers) {
    return peers.map(peer => toLocalIp(peer))
}
//'hello' -> 'myPort:hello'
function formatMessage(message) {
    return me + '>' + message
}
//'127.0.0.1:4000' -> '4000'
function extractPortFromIp(peer) {
    return peer.toString().slice(peer.length - 4, peer.length);
}
//'4000>hello' -> '4000'
function extractReceiverPeer(message) {
    return message.slice(0, 4);
}
//'4000>hello' -> 'hello'
function extractMessageToSpecificPeer(message) {
    return message.slice(5, message.length);
}
