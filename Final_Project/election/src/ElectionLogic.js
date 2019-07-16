var Web3 = require('web3');
var TruffleContract = require("truffle-contract");
const Election = require('./contract_copy/Election.json');

class ElectionWeb3 {

  constructor(num) {
    this.web3Provider = null;
    this.electionInstance = null;
    this.web3 = null;
    this.contracts = { Election: null };
    this.account = '0x0'
  }

  async initWeb3({ eventsCallBack }) {

    // if (window.ethereum) {
    //   this.web3Provider = window.ethereum;
    //   try {
    //     // Request account access
    //     await window.ethereum.enable();
    //   } catch (error) {
    //     // User denied account access...
    //     console.error("User denied account access")
    //   }
    // }
    // // Legacy dapp browsers...
    // else if (window.web3) {
    //   this.web3Provider = window.web3.currentProvider;
    // }
    // // If no injected web3 instance is detected, fall back to Ganache
    // else {
    //   this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    // }
    this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    this.web3 = new Web3(this.web3Provider);

    // Contract
    const election = TruffleContract(Election);
    election.setProvider(this.web3Provider);
    this.contracts.Election = election;

    // Account
    const account = await this.web3.eth.getCoinbase();
    this.account = account;

    // Instance init
    const instance = await election.deployed();
    this.electionInstance = instance;

    // Register Events
    instance.votingEvent({
        fromBlock: 0,
        toBlock: 'latest'
    },eventsCallBack)

    instance.candidateEvent({
        fromBlock: 0,
        toBlock: 'latest'
    },eventsCallBack)

    instance.addVoterEvent({
        fromBlock: 0,
        toBlock: 'latest'
    },eventsCallBack)
    // Candidates Count
    const count =  await instance.numberOfCandidates();

    var candidates = []

    for (var i = 1; i <= count; i++) {
      const candidate = await instance.candidates(i);
      candidates.push({
        id: candidate[0],
        name: candidate[1],
        voteCount: candidate[2]
      })
    }

    return candidates;

  }
  //MARK: - Setters
  async castVote({ candidateId }) {
    try {
      var accounts = this.web3.eth.accounts;
      console.log(accounts); // ["0x407d73d8a49eeb85d32cf465507dd71d507100c1"]
      const res = await this.electionInstance.vote(candidateId, {from: this.account });
      return res;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async registerAsVoter() {
    return await this.addVoter({address: this.account});
  }

  async addVoter({ address }) {
    try {
      const res = await this.electionInstance.addVoter(address, {from: this.account });
      return res;
    } catch (error){
      console.log(error);
      return null;
    }

  }

  async setElectionDates({startDate, endDate}) {
    try {
      const s = Math.floor(startDate.getTime() / 1000);
      const e = Math.floor(endDate.getTime() / 1000);
      const res = await this.electionInstance.defineVotingDates(s, e, {from: this.account });
      return res;
    } catch (error){
      console.log(error)
      return null;
    }

  }

  async addCandidate({ candidate }) {
    try {
      const res = await this.electionInstance.addingCandidate(candidate.fullName, candidate.agenda, {from: this.account });
      return res;
    } catch (error){
      console.log(error)
      return null;
    }

  }

  //MARK: Getters
  getAccount() {
    return this.account;
  }

  async voterStatus() {
    try {
      const res = await this.electionInstance.voterStatus({from: this.account });
      return res;
    } catch (error){
      console.log(error)
      return 0;
    }

  }

  formatDate = timestamp => {
    const date = new Date(timestamp*1000);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  async endDate() {
    try {
      const res = await this.electionInstance.votingEndDate();
      return this.formatDate(res);
    } catch (error){
      console.log(error)
      return null;
    }
  }

  async startDate() {
    try {
      const res = await this.electionInstance.votingStartDate();
      return this.formatDate(res);
    } catch (error){
      console.log(error)
      return null;
    }
  }

};

export default ElectionWeb3
