var Web3 = require('web3');
var TruffleContract = require("truffle-contract");
const Election = require('./contract_copy/Election.json');

class Contract {
  constructor() {
    this.web3Provider = null;
    this.electionInstance = null;
    this.web3 = null;
    this.contracts = { Election: null };
    this.account = '0x0'
    this.isInit = false
    this.isListening = false
  }

  async init() {
    if (this.isInit) {
      console.log("ElectionWeb3 is already init")
      return;
    };
    this.isInit = true;

    if (window.ethereum) {
      this.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      this.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    // this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    this.web3 = new Web3(this.web3Provider);

    // Contract
    const election = TruffleContract(Election);
    election.setProvider(this.web3Provider);
    this.contracts.Election = election;

    // Account
    const account = await this.web3.eth.getCoinbase();
    this.account = account;

    // Instance init
    try {
      this.electionInstance = await election.deployed();;
    } catch (error) {
      console.log(error);
      alert("Please set account in Metamask")
    }
  }
}

export default Contract
