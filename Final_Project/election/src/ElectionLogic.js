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
    this.isInit = false
    this.isListening = false
  }

  async initWeb3() {
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

  //MARK: - Setters
  setEventListener({ eventsCallBack }) {
    if (this.isListening) {
      console.log("ElectionWeb3 is already listen")
      return;
    };
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return;
    }
    this.isListening = true;
    // Register Events

    this.electionInstance.adminSwitchEvent({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.electionInstance.VotingTookPlace({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.electionInstance.CandidatesAdded({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.electionInstance.VotersAdded({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.electionInstance.VoterGotPaidForVoting({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)

  }

  async becomeAdmin() {
    try {
      const res = await this.electionInstance.setAdmin(this.account, {from: this.account });
      return res;
    } catch (error) {
      console.log(error);
      alert(error.reason)
      return null;
    }
  }

  async castVote({ candidateId }) {
    try {
      var accounts = this.web3.eth.accounts;
      console.log(accounts); // ["0x407d73d8a49eeb85d32cf465507dd71d507100c1"]
      const res = await this.electionInstance.vote(candidateId, {from: this.account });
      return res;
    } catch (error) {
      console.log(error);
      alert(error.reason)
      return null;
    }
  }

  async registerAsVoter() {
    return await this.addVoters({addresses: [this.account]});
  }

  async addVoters({ addresses }) {
    try {
      const res = await this.electionInstance.addVoters(addresses, {from: this.account });
      return res;
    } catch (error){
      console.log(error);
      alert(error.reason)
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
      alert(error.reason)
      return null;
    }

  }

  async addCandidate({ candidate }) {
    try {

      const res = await this.electionInstance.addingCandidate(
        candidate.fullName,
        candidate.agenda,
        candidate.image,
        candidate.address, 
        {from: this.account }
      );
      return res;
    } catch (error){
      console.log(error)
      alert(error)
      return null;
    }

  }

  //MARK: Getters
  async registeredVoters() {
    try {
      var voters = []
      const count =  await this.electionInstance.numberOfVoters()

      for (var i = 1; i <= count; i++) {
        const voter = await this.electionInstance.registeredVoters(i);
        voters.push(voter)
      }
      return voters;
    } catch (error) {
      console.log(error);
      // alert(error)
      return [];
    }
  }

  async votingCoinBalance() {
    try {
      const balance = await this.electionInstance.balanceOf(this.account)
      return parseInt(balance);
    } catch (error) {
      console.log(error);
      alert(error)
      return 0;
    }
  }

  async isAdmin() {
    try {
      const adminAccout = await this.electionInstance.admin()
      const isAdmin =  (adminAccout.toUpperCase() == this.account.toUpperCase());
      return isAdmin;
    } catch (error) {
      console.log(error);
      alert(error)
      return false;
    }

  }
  async getCandidates() {
    try {
      // Candidates Count
      const count =  await this.electionInstance.numberOfCandidates();

      var candidates = []

      for (var i = 1; i <= count; i++) {
        const candidate = await this.electionInstance.candidates(i);
        candidates.push({
          id: candidate[0],
          name: candidate[1],
          agenda: candidate[2],
          voteCount: candidate[3]
        })
      }

      candidates.sort(function(c1 ,c2) {
        const v1 = parseInt(c1.voteCount)
        const v2 = parseInt(c2.voteCount)
        const res = v1 - v2;
        console.log(res)
        return res
      });
      return candidates;
    } catch (error) {
        console.log(error)
        alert(error)
        return [];
      }

  }
  getAccount() {
    return this.account;
  }

  async voterStatus() {
    try {
      // const res = await this.electionInstance.voterStatus({from: this.account });
      const res = await this.electionInstance.voters(this.account);
      return res;
    } catch (error){
      console.log(error)
      alert(error)
      return 0;
    }

  }

  async isVotingDatesConfigured() {
    try {
      const res = await this.electionInstance.isVotingDatesConfigured();
      return res;
    } catch (error){
      console.log(error)
      alert(error)
      return false;
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
      alert(error)
      return null;
    }
  }

  async startDate() {
    try {
      const res = await this.electionInstance.votingStartDate();
      return this.formatDate(res);
    } catch (error){
      console.log(error)
      alert(error)
      return null;
    }
  }

};

export default ElectionWeb3
