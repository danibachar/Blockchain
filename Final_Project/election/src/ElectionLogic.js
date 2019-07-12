var Web3 = require('web3');
var TruffleContract = require("truffle-contract");
const Election = require('./Election.json');

class ElectionWeb3 {

  constructor(num) {
    this.web3Provider = null;
    this.electionInstance = null;
    this.web3 = null;
    this.contracts = { Election: null };
    this.account = '0x0'
    this.hasVoted = false
  }

  // init() {
  //   ElectionWeb3.initWeb3();
  // }

  async initWeb3() {

    this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    this.web3 = new Web3(this.web3Provider);

    const election = TruffleContract(Election);
    election.setProvider(this.web3Provider);

    this.contracts.Election = election;

    try {
      const account = await this.web3.eth.getCoinbase();
      this.account = account;
    } catch (error) {
      console.log(error)
    }
    //
    // election.deployed().then((instance)=>{
    //   this.electionInstance = instance;
    // }).catch((error)=>{
    //   console.log(console.log(error));
    // });

    try {
      const instance = await election.deployed();
      this.electionInstance = instance;

      const count =  await instance.candidatesCount();
      console.log(count)
    } catch (error) {
      console.log(error)
    }


    // this.account = account;
    // fetch("Election.json").then((election) => {
    //   ElectionWeb3.contracts.Election = TruffleContract(election);
    //   // Connect provider to interact with contract
    //   ElectionWeb3.contracts.Election.setProvider(ElectionWeb3.web3Provider);
    // });
    //
    // // Load account data
    // ElectionWeb3.web3.eth.getCoinbase(function(err, account) {
    //   if (err === null) {
    //     ElectionWeb3.account = account;
    //     // $("#accountAddress").html("Your Account: " + account);
    //
    //   }
    // });
    //
    // ElectionWeb3.contracts.Election.deployed().then((instance) => {
    //   ElectionWeb3.electionInstance = instance;
    //   return ElectionWeb3.electionInstance.candidatesCount();
    // }).then((candidatesCount) => {
    //   console.log(candidatesCount)
    // });
    // // TODO: refactor conditional
    // if (typeof web3 !== 'undefined') {
    //   // If a web3 instance is already provided by Meta Mask.
    //   // App.web3Provider = web3.currentProvider;
    //   // web3 = new Web3(web3.currentProvider);
    //   ElectionWeb3.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    //   web3 = new Web3(ElectionWeb3.web3Provider);
    // } else {
    //   // Specify default instance if no web3 instance provided
    //   ElectionWeb3.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    //   web3 = new Web3(ElectionWeb3.web3Provider);
    // }
    // return ElectionWeb3.initContract();
  }

};

export default ElectionWeb3
