import React, { Component } from 'react';
import ElectionWeb3 from '../ElectionLogic';

//UI Components
import ChartsView from './ChartsView'
import ChooseCandidateAndVoteView from './ChooseCandidateAndVoteView'
import AccountsSelectionView from './AccountsSelectionView'

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';



var el = new ElectionWeb3()

export default class VotersView extends Component {
  constructor() {
    super();
    this.state = {
      candidatesNames: [],
      candidatesVotesCount: [],
      candidatesIds: [],
      // Selection For Voting
      selectedCandidates: {},
      candidatesSelectionOptions: [],
      //UI
      myVoterStatus: 0,
      isLoading: true,
      myAccount: "",
      isVotingDatesConfigured: false,
     };


     //Events
     this.contractEvents = this.contractEvents.bind(this);
     //Actions
     this.vote = this.vote.bind(this);
     this.registerAsVoter = this.registerAsVoter.bind(this);
     this.becomeAdmin = this.becomeAdmin.bind(this);
     this.updateState = this.updateState.bind(this);
  }

	async componentWillMount() {
    this.setState({ isLoading: true });
    await el.initWeb3();
    el.setEventListener({ eventsCallBack: this.contractEvents })
    await this.updateState()
    this.setState({ isLoading: false });
  }

  async updateState() {
    this.setState({ isLoading: true });
    const candidates = await el.getCandidates()
    const candidatesIds = candidates.map(x => x.id);
    const candidatesSelectionOptions = candidates.map((x)=>{return {value: x.id, label: `${x.name}, agenda: ${x.agenda}`}});

    const voterStatus = await el.voterStatus();
    const isVotingDatesConfigured = await el.isVotingDatesConfigured();
    const account = el.getAccount();
    const startDate = await el.startDate();
    const endDate = await el.endDate();

    this.setState({
      candidatesIds: candidatesIds,
      candidatesSelectionOptions: candidatesSelectionOptions,
      isLoading: false,
      myVoterStatus: voterStatus,
      myAccount: account,
      isVotingDatesConfigured: isVotingDatesConfigured,
      startDate: startDate,
      endDate: endDate,
    });
  }

  async contractEvents() {
    await this.updateState();
  };

  //MARK: - Votes
  handleCandidateSelectionChange = selectedCandidates => {
    this.setState({ selectedCandidates });
  };

  async registerAsVoter() {
    this.setState({ isLoading: true });
    const res = await el.registerAsVoter();
    this.setState({ isLoading: false });
  };

  async vote()  {
    this.setState({ isLoading: true });
    const candidateId = this.state.selectedCandidates.value
    const res = await el.castVote({candidateId});
    this.setState({ isLoading: false });
  };

  async becomeAdmin()  {
    this.setState({ isLoading: true });
    const res = await el.becomeAdmin();
    this.setState({ isLoading: false });
  };

  render() {

    if (this.state.isLoading) {
      return <div ref="container">
      {
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      }
        </div>
    }
    let votingButtonTitle = "Vote"
    if (this.state.myVoterStatus == 0) {
      votingButtonTitle = "You are not listed as a voter"
    }
    if (this.state.myVoterStatus == 2) {
      votingButtonTitle = "You already voted - you can vote only once"
    }
    const now = new Date()
    const whileVoting = (this.state.startDate < now) && (this.state.endDate > now);
    const status = parseInt(this.state.myVoterStatus);
    const canVote = (status == 1 && whileVoting);
    const isRegisterAsVoterAlreay = (0 < status);
    const startDate = this.state.startDate.toString();
    const endDate = this.state.endDate.toString();
    let electionDateTitle = "Election will run between the dates: \n" + startDate + "\n until \n" + endDate;
    if (!this.state.isVotingDatesConfigured) {
      electionDateTitle = "Voting Dates Not set yet"
    }

    return <div ref="container">
    { <h2>Hello, {this.state.myAccount}!</h2> }
    { <h4> {electionDateTitle} </h4> }
    {<h4>Select Candidate:</h4> }
    {
      <ChooseCandidateAndVoteView
      options={this.state.candidatesSelectionOptions}
      selectedOption={this.state.selectedCandidates}
      handleChange={this.handleCandidateSelectionChange}
      />
    }
    {
      <Button
      variant="primary"
      disabled={!canVote}
      onClick={this.vote}
      >
      {votingButtonTitle}
      </Button>
    }
    {
      <Button
      variant="primary"
      disabled={isRegisterAsVoterAlreay}
      onClick={this.registerAsVoter}
      >
      {isRegisterAsVoterAlreay ? 'You are in the voters list' : 'Register As Voter'}
      </Button>
    }
    {
      <Button
      variant="primary"
      disabled={false}
      onClick={this.becomeAdmin}
      >
      {'Become admin and switch to admin console'}
      </Button>
    }
    </div>
  }
}
