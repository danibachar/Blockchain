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

    this.isCandidate = false
    this.state = {
      candidates: [],
      questions: [],
      candidates: [],
      registeredVoters: [],
      isAdmin: null,

    }
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

    let isCandidate =  await this.electionInstance.isCandidate(this.account, {from: this.account})
    // isCandidate = parseInt(isCandidate)
    this.isCandidate = isCandidate

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
    this.electionInstance.VotingTookPlace({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.electionInstance.CandidatesAdded({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.electionInstance.VotersAdded({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.electionInstance.VoterGotPaidForVoting({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.electionInstance.NewQuestion({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.electionInstance.NewAnswer({ fromBlock: 0, toBlock: 'latest' }, eventsCallBack)
    this.web3Provider.on('accountsChanged', function (accounts) {
      window.location.reload();
    })


  }

  async addAnswer({ answer, questionId }) {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return null;
    }
    try {
      const res = await this.electionInstance.addAnswer(answer, questionId, {from: this.account });
      //this.state.questions.find(); and append
      return res;
    } catch (error) {
      console.log(error);
      alert(error.reason)
      return null;
    }
  }

  async addQuestion({ question }) {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return null;
    }
    try {
      const res = await this.electionInstance.addQuestion(question, {from: this.account });
      this.state.questions.push(question);
      return res;
    } catch (error) {
      console.log(error);
      alert(error.reason)
      return null;
    }
  }

  async castVote({ candidateId }) {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return null;
    }
    try {
      var accounts = this.web3.eth.accounts;
      const res = await this.electionInstance.vote(candidateId, {from: this.account });
      return res;
    } catch (error) {
      console.log(error);
      alert(error.reason)
      return null;
    }
  }

  async registerAsVoter() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return null;
    }
    return await this.addVoters({addresses: [this.account]});
  }

  async addVoters({ addresses }) {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return null;
    }
    try {
      const res = await this.electionInstance.addVoters(addresses, {from: this.account });
      this.state.registeredVoters.push(addresses);
      return res;
    } catch (error){
      console.log(error);
      alert(error.reason)
      return null;
    }

  }

  async setElectionDates({startDate, endDate}) {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return null;
    }
    try {
      const s = startDate.getTime()/1000;
      const e = endDate.getTime()/1000;
      const res = await this.electionInstance.defineVotingDates(
        parseInt(s),  parseInt(e), {from: this.account }
      );
      this.state.startDate = startDate;
      this.state.endDate = endDate;
      return res;
    } catch (error){
      console.log(error)
      alert(error.reason)
      return null;
    }

  }

  async addCandidate({ candidate }) {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return null;
    }
    try {

      const res = await this.electionInstance.addingCandidate(
        candidate.fullName,
        candidate.agenda,
        candidate.image,
        candidate.address,
        {from: this.account }
      );
      this.state.candidates.push(candidate);
      return res;
    } catch (error){
      console.log(error)
      alert(error)
      return null;
    }

  }

  //MARK: Getters
  async getQuestions() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return []
    }
    if (!this.isCandidate) {
      return []
    }
    if (this.state.questions.length > 0) {
      return this.state.questions;
    }
    try {
      let count =  await this.electionInstance.numberOfQuestions();
      count = parseInt(count)
      var questions = []
      for (var i = 1; i <= count; i++) {
        const q = await this.electionInstance.questionList(i);
        questions.push({
          id: i,
          question: q[0],
          answerCounter: parseInt(q[1]),
          questioner: q[2],
          answers:{}

        })
        //Adding Answers To Questions
        // mapping (uint => mapping (address => string)) public answerList;
        // answerList[_questionId][msg.sender] = _answer; // save answer of the candidate
        if (this.state.candidates.length == 0) {
          await this.getCandidates();
        }
        const candidatesCount = this.state.candidates.length;
        for (var j = 0; j < candidatesCount; j++) {
          const candidate = this.state.candidates[j]
          const answer = await this.electionInstance.answerList(i, candidate.address);
          if (answer) {
            questions[i-1].answers[candidate.address] = answer
          }
        }

      }
      this.state.questions = questions;
      return questions;
    } catch (error) {
      console.log(error);
      alert(error)
      return [];
    }
  }

  async registeredVoters() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return []
    }
    if (this.state.registeredVoters.length > 0) {
      return this.state.registeredVoters;
    }
    try {
      var voters = []
      const count =  await this.electionInstance.numberOfVoters()

      for (var i = 1; i <= count; i++) {
        const voter = await this.electionInstance.registeredVoters(i);
        voters.push(voter)
      }
      this.state.registeredVoters = voters;
      return voters;
    } catch (error) {
      console.log(error);
      alert(error.reason);
      return [];
    }
  }

  async votingCoinBalance() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return 0
    }
    if (this.state.balance !== undefined) {
      return this.state.balance;
    }
    try {
      const balance = await this.electionInstance.balanceOf(this.account)
      this.state.balance = parseInt(balance);
      return this.state.balance;
    } catch (error) {
      console.log(error);
      alert(error)
      return 0;
    }
  }

  async isAdmin() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return false
    }
    if (this.state.isAdmin !== null) {
      return this.state.isAdmin;
    }
    try {
      const adminAccout = await this.electionInstance.admin()
      const isAdmin =  (adminAccout.toUpperCase() == this.account.toUpperCase());
      this.state.isAdmin = isAdmin;
      return isAdmin;
    } catch (error) {
      console.log(error);
      alert(error)
      return false;
    }
  }

  async isElectionEnded() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return false
    }
    if (this.state.isElectionEnded !== null && this.state.isElectionEnded !== undefined) {
      return this.state.isElectionEnded;
    }
    try {
      const endVoting = await this.electionInstance.endVoting()
      this.state.isElectionEnded = endVoting;
      return endVoting;
    } catch (error) {
      console.log(error);
      alert(error)
      return false;
    }

  }

  async getCandidates() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return []
    }
    if (this.state.candidates.length > 0) {
      return this.state.candidates;
    }
    try {
      const count =  await this.electionInstance.numberOfCandidates();
      var candidates = []
      for (var i = 1; i <= count; i++) {
        const candidate = await this.electionInstance.candidates(i);

        candidates.push({
          id: parseInt(candidate[0]),
          name: candidate[1],
          agenda: candidate[2],
          voteCount: parseInt(candidate[3]),
          image: candidate[4],
          address: candidate[5],
        })
      }
      candidates.sort((c1 ,c2) => { return c2.voteCount-c1.voteCount });
      this.state.candidates = candidates;
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
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return 0
    }
    if (this.state.voterStatus !== undefined) {
      return this.state.voterStatus;
    }
    try {
      // const res = await this.electionInstance.voterStatus({from: this.account });
      const res = await this.electionInstance.voters(this.account);
      this.state.voterStatus = parseInt(res);
      return this.state.voterStatus;
    } catch (error){
      console.log(error)
      alert(error)
      return 0;
    }

  }

  async isVotingDatesConfigured() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return false
    }
    if (this.state.isVotingDatesConfigured !== undefined) {
      return this.state.isVotingDatesConfigured;
    }
    try {
      const res = await this.electionInstance.isVotingDatesConfigured();
      this.state.isVotingDatesConfigured = res;
      return res;
    } catch (error){
      console.log(error)
      alert(error)
      return false;
    }

  }

  formatDate = timestamp => {
    const t = parseInt(timestamp)*1000;
    const date = new Date(t);
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  }

  async endDate() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return null
    }
    if (this.state.endDate !== undefined) {
      return this.state.endDate;
    }
    try {
      const res = await this.electionInstance.votingEndDate();
      this.state.endDate = this.formatDate(res);
      return this.state.endDate;
    } catch (error){
      console.log(error)
      alert(error)
      return null;
    }
  }

  async startDate() {
    if (!this.electionInstance) {
      console.log("Contract not deployed");
      return null
    }
    if (this.state.startDate !== undefined) {
      return this.state.startDate;
    }
    try {
      const res = await this.electionInstance.votingStartDate();
      this.state.startDate = this.formatDate(res);
      return this.state.startDate;
    } catch (error){
      console.log(error)
      alert(error)
      return null;
    }
  }

};

export default ElectionWeb3
