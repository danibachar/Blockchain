import React, { Component } from 'react';
import ElectionWeb3 from '../ElectionLogic';

//UI Components
import ChartsView from './ChartsView'
import ChooseCandidateAndVoteView from './ChooseCandidateAndVoteView'
import AccountsSelectionView from './AccountsSelectionView'

import Calendar from 'react-calendar';
import TimePicker from 'react-time-picker';

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';

var TimeFormat = require('hh-mm-ss')

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
      voterStatus: 0,
      isLoading: false,
      canVote: false,
      myAccount: "",
      //Dates
      dateRange: [null, null],
      endHour: "23:22",
      startHour: null,
      //Candidate registration
      registerCandidate: {fullName: "", address: "", agenda: ""}
     };

     //Events
     this.contractEvents = this.contractEvents.bind(this);
     //Actions
     this.vote = this.vote.bind(this);
     this.registerAsVoter = this.registerAsVoter.bind(this);
     this.setElectionDates = this.setElectionDates.bind(this);
     this.registerCandidate = this.registerCandidate.bind(this);
     this.addVoter = this.addVoter.bind(this);

     this.updateState = this.updateState.bind(this);
  }

	async componentWillMount() {
    await this.updateState()
  }

  async updateState() {
    this.setState({ isLoading: true });
    const candidates = await el.initWeb3({ eventsCallBack: this.contractEvents });
    const candidatesNames = candidates.map(x => x.name);
    const candidatesVotesCount = candidates.map(x => x.voteCount);
    const candidatesIds = candidates.map(x => x.id);
    const candidatesSelectionOptions = candidates.map((x)=>{return {value: x.id, label: x.name}});

    const voterStatus = await el.voterStatus();
    const account = el.getAccount();
    const startDate = await el.startDate();
    const endDate = await el.endDate();
    console.log(startDate)
    console.log(endDate)

    this.setState({
      candidatesNames: candidatesNames,
      candidatesVotesCount: candidatesVotesCount,
      candidatesIds: candidatesIds,
      candidatesSelectionOptions: candidatesSelectionOptions,
      isLoading: false,
      voterStatus: voterStatus,
      myAccount: account,
      dateRange: [startDate, endDate],
      startHour: TimeFormat.fromS(startDate.getHours()*60 + startDate.getMinutes()),
      endHour: TimeFormat.fromS(endDate.getHours()*60 + endDate.getMinutes()),
    });
  }

  contractEvents = () => {
    this.render();
    console.log("event")
  };

  //MARK: - Votes
  handleCandidateSelectionChange = selectedCandidates => {
    this.setState({ selectedCandidates });
  };

  async registerAsVoter() {
    this.setState({ isLoading: true });
    const res = await el.registerAsVoter();
    console.log(res);
    this.setState({ canVote: true, isLoading: false });
  };

  async vote()  {
    this.setState({ isLoading: true });
    const candidateId = this.state.selectedCandidates.value
    const res = await el.castVote({candidateId});
    console.log(res);
    this.setState({ voterStatus: 2, isLoading: false });
  };

  //MARK: - Candidates
  setRegisterCandidateFullName = event => {
    this.setState({
        registerCandidate: {
          fullName: event.target.value,
          agenda: this.state.registerCandidate.agenda,
        }
      })
  }

  setRegisterCandidateAgenda = event => {
    this.setState({
        registerCandidate: {
          fullName: this.state.registerCandidate.fullName,
           agenda: event.target.value
         }
      })
  }

  async registerCandidate() {
    this.setState({ isLoading: true });
    const res = await el.addCandidate({candidate: this.state.registerCandidate})
    console.log(res);
    this.setState({ isLoading: false });
  }
  //Voters
  async addVoter(event) {
    this.setState({ isLoading: true });
    const res = await el.addVoter({address: this.state.registerCandidate})
    console.log(event.target.value);
    this.setState({ isLoading: false });
  }

  //MARK: Dates
  setElectionDate = dateRange => { this.setState({ dateRange: dateRange }) }
  setStartHour = startHour => { this.setState({ startHour: startHour }) }
  setEndHour = endHour => { this.setState({ endHour: endHour }) }

  async setElectionDates() {
    this.setState({ isLoading: true });
    var startDate = this.state.dateRange[0];
    var endDate = this.state.dateRange[1];

    const startHour = this.state.startHour.split(":");

    let hoursToAdd = parseInt(startHour[0])*60*60*1000
    let minutesToAdd = parseInt(startHour[1])*60*1000
    console.log(startDate)
    startDate = new Date(startDate.getTime() + hoursToAdd + minutesToAdd);
    console.log(startDate)

    console.log(startDate)
    const endHour = this.state.endHour;

    hoursToAdd = parseInt(endHour[0])*60*60*1000
    minutesToAdd = parseInt(endHour[1])*60*1000
    console.log(endDate)
    endDate = new Date(endDate.getTime() + hoursToAdd + minutesToAdd);
    console.log(endDate)

    const res = await el.setElectionDates({ startDate, endDate });
    console.log(res);
    this.setState({ isLoading: false });
  }

  render() {
    return <div ref="container">
    {
      <h3>Hello, {this.state.myAccount}!</h3>
    }
    {
      <
      ChartsView
      candidatesNames={this.state.candidatesNames}
      candidatesVotesCount={this.state.candidatesVotesCount}
      />
    }
    {
      <
      ChooseCandidateAndVoteView
      options={this.state.candidatesSelectionOptions}
      selectedOption={this.state.selectedCandidates}
      handleChange={this.handleCandidateSelectionChange}
      />
    }
    {
      <
      Button
      variant="primary"
      disabled={this.state.isLoading}
      onClick={(!this.state.isLoading || this.voterStatus != 0) ? this.vote : null}
      >
      {this.state.isLoading ? 'Loading…' : 'Vote'}
      </Button>
    }
    {
      <
      Button
      variant="primary"
      disabled={this.state.isLoading}
      onClick={(!this.state.isLoading) ? this.registerAsVoter : null}
      >
      {this.state.isLoading ? 'Loading…' : 'Register As Voter'}
      </Button>
    }
    {
      <
      Calendar
      onChange={this.setElectionDate}
      value={this.state.dateRange}
      selectRange={true}
      minDate={(new Date())}
      />
    }
    {
      <TimePicker
          onChange={this.setStartHour}
          value={this.state.startHour}
          disableClock={false}
        />
    }
    {
      <TimePicker
          onChange={this.setEndHour}
          value={this.state.endHour}
          disableClock={false}
        />
    }
    {
      <
      Button
      variant="primary"
      disabled={this.state.isLoading && this.state.dateRange.length < 2 && this.state.dateRange[0] == this.state.dateRange[1]}
      onClick={(!this.state.isLoading && this.state.dateRange.length == 2 && this.state.dateRange[0] != this.state.dateRange[1]) ? this.setElectionDates : null}
      >
      {this.state.isLoading ? 'Loading…' : 'Set Election Dates'}
      </Button>
    }
    {
    <Form>
      <Form.Group controlId="formFullName">
        <Form.Label>Candidate Full Name: </Form.Label>
        <
        Form.Control
          as="input"
          type="text"
          placeholder="Enter Full Name"
          value={this.state.registerCandidate.fullName}
          onChange={this.setRegisterCandidateFullName}
         />
      </Form.Group>

      <Form.Group controlId="formAgenda">
        <Form.Label>Candidate Agend: </Form.Label>
        <
        Form.Control
          as="input"
          type="text"
          placeholder="Enter Agenda"
          value={this.state.registerCandidate.agenda}
          onChange={this.setRegisterCandidateAgenda}
        />
      </Form.Group>
      <Button
        variant="primary"
        type="submit"
        disabled={this.state.isLoading}
        onClick={(!this.state.isLoading) ? this.registerCandidate : null}
      >
        {this.state.isLoading ? 'Loading…' : 'Register Candidate'}
      </Button>
    </Form>
    }
    {
    <Form>
      <Form.Group controlId="formFullName">
        <Form.Label>Voter Address: </Form.Label>
        <
        Form.Control
          as="input"
          type="text"
          placeholder="Enter Address"
          onChange={this.addVoter}
         />
      </Form.Group>
      <Button
        variant="primary"
        type="submit"
        disabled={this.state.isLoading}
        onClick={(!this.state.isLoading) ? this.registerCandidate : null}
      >
        {this.state.isLoading ? 'Loading…' : 'Register Candidate'}
      </Button>
    </Form>
    }
    </div>
  }
}
