import React, { Component } from 'react';
import ElectionWeb3 from '../ElectionLogic';

import ChartsView from './ChartsView'

import Calendar from 'react-calendar';
import TimePicker from 'react-time-picker';
import CSVReader from 'react-csv-reader'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import { TableHeaderColumn ,BootstrapTable } from 'react-bootstrap-table-next';


var TimeFormat = require('hh-mm-ss')

var el = new ElectionWeb3()

export default class AdminsView extends Component {
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
      votingCoinBalance: 0,
      //Dates
      dateRange: [null, null],
      endHour: null,
      startHour: null,
      isVotingDatesConfigured: false,
      //Candidate registration
      registerCandidate: {fullName: "", address: "", agenda: ""},
      //Voter
      votersToAdd: { addresses: [] },
      registeredVoters:[],
     };
     //Events
     this.contractEvents = this.contractEvents.bind(this);
     //Actions
     this.registerCandidate = this.registerCandidate.bind(this);
     this.setElectionDates = this.setElectionDates.bind(this);
     this.addVoters = this.addVoters.bind(this);
     this.addVotersFromFile = this.addVotersFromFile.bind(this);
     // Private
     this.updateState = this.updateState.bind(this);
  }

  async componentWillMount() {
    this.setState({ isLoading: true });
    await el.initWeb3();
    el.setEventListener({ eventsCallBack: this.contractEvents })
    await this.updateState()
    this.setState({ isLoading: false });
  }

  async contractEvents() {
    await this.updateState();
  };

  //MARK: - state
  async updateState() {
    this.setState({ isLoading: true });
    const candidates = await el.getCandidates()
    const candidatesNames = candidates.map(x => x.name);
    const candidatesVotesCount = candidates.map(x => x.voteCount);

    const account = el.getAccount();
    const registeredVoters = await el.registeredVoters();
    const votingCoinBalance = await el.votingCoinBalance();
    const isVotingDatesConfigured = await el.isVotingDatesConfigured();
    const startDate = await el.startDate();
    const endDate = await el.endDate();

    this.setState({
      isLoading: false,
      candidatesNames: candidatesNames,
      candidatesVotesCount: candidatesVotesCount,
      myAccount: account,
      dateRange: [startDate, endDate],
      startHour: TimeFormat.fromS(startDate.getHours()*60 + startDate.getMinutes()),
      endHour: TimeFormat.fromS(endDate.getHours()*60 + endDate.getMinutes()),
      isVotingDatesConfigured: isVotingDatesConfigured,
      registeredVoters: registeredVoters,
      votingCoinBalance: votingCoinBalance,votingCoinBalance
    });
  }

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
    this.setState({ isLoading: false, registerCandidate:'' });
  }

  //MARK: - Voters
  setRequestedVoterAddress = event => {
    this.setState({ votersToAdd: { addresses: [event.target.value]} })
  }

  async addVotersFromFile(votersList) {
    this.state.votersToAdd.addresses = votersList.map(v=>v[0]);
    await this.addVoters()
  }

  errorInFileUpload(error) {
    console.log(error)
    alert(error)
  }

  async addVoters() {
    this.setState({ isLoading: true });
    const res = await el.addVoters({ addresses: this.state.votersToAdd.addresses })
    this.setState({ isLoading: false, votersToAdd: {}});
  }

  //MARK: - Dates
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
    startDate = new Date(startDate.getTime() + hoursToAdd + minutesToAdd);
    const endHour = this.state.endHour;

    hoursToAdd = parseInt(endHour[0])*60*60*1000
    minutesToAdd = parseInt(endHour[1])*60*1000
    endDate = new Date(endDate.getTime() + hoursToAdd + minutesToAdd);

    const res = await el.setElectionDates({ startDate, endDate });
    this.setState({ isLoading: false });
  }

  render() {
    if (this.state.isLoading) {
      return <div ref="container">
      {
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading... you might need to approve the transaction in your Metamask account</span>
        </Spinner>
      }
        </div>
    }

    let calendarTitle = "To start the election you must select a voting time frame"
    if (this.state.isVotingDatesConfigured) {
      calendarTitle = "Voting Dates configured, you may start register voters and candidates"
    }

    var registeredVoters = []
    var i = 0;
    for (i = 0; i< this.state.registeredVoters.length; i++) {
      registeredVoters.push({
        id:i,
        address: this.state.registeredVoters[i]
      })
    }
    console.log("$$$$")
    console.log(registeredVoters)
    console.log("####")

    return <div ref="container">
      { <h2>Hello, {this.state.myAccount}.</h2> }
      { <h2>You are an Admin.</h2> }
      { <h4>Wallet Balance: {this.state.votingCoinBalance}.</h4> }
      { <h4>Set dates to start config election</h4> }
      {
        < Calendar
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
        <Button
        variant="primary"
        disabled={this.state.dateRange.length < 2 && this.state.dateRange[0] == this.state.dateRange[1]}
        onClick={(this.state.dateRange.length == 2 && this.state.dateRange[0] != this.state.dateRange[1]) ? this.setElectionDates : null}
        >
        {'Set Election Dates'}
        </Button>
      }
      { <h4>Only admins can register new Candidates:</h4> }
      {
      <Form>
        <Form.Group controlId="formFullName">
          <Form.Label>Candidate Full Name: </Form.Label>
          <Form.Control
            as="input"
            type="text"
            placeholder="Enter Full Name"
            value={this.state.registerCandidate.fullName}
            onChange={this.setRegisterCandidateFullName}
           />
        </Form.Group>

        <Form.Group controlId="formAgenda">
          <Form.Label>Candidate Agend: </Form.Label>
          <Form.Control
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
          disabled={false}
          onClick={this.registerCandidate}
        >
          {'Register Candidate'}
        </Button>
      </Form>
      }
      { <h4>Only admins can register new voters:</h4> }
      {
      <Form>
        <Form.Group controlId="formVoterAddress">
          <Form.Label>Voter Address: </Form.Label>
          <Form.Control
            as="input"
            type="text"
            placeholder="Enter Address"
            value={this.state.votersToAdd.address}
            onChange={this.setRequestedVoterAddress}
           />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={false}
          onClick={this.addVoter}
        >
          {'Register Voter'}
        </Button>
      </Form>
      }
      {
        <CSVReader
        cssClass="csv-reader-input"
        label="Upload CSV file with a list of voters to register"
        onFileLoaded={this.addVotersFromFile}
        onError={this.errorInFileUpload}
        inputId="ObiWan"
        inputStyle={{color: 'red'}}
      />
      }
      { <h4>Live election status:</h4> }
      {
        <ChartsView
        candidatesNames={this.state.candidatesNames}
        candidatesVotesCount={this.state.candidatesVotesCount}
        />
      }
      { <h4>Registered Voters:</h4> }
    </div>
  }
}


// {
  // <BootstrapTable keyField='id' data={ registeredVoters } columns={ [{dataField:'id', text: 'ID',dataField: 'addrss', text: 'Register Voters' }] } />
//   <BootstrapTable data={ registeredVoters } >
//     <TableHeaderColumn dataField='id' isKey={ true }>ID</TableHeaderColumn>
//     <TableHeaderColumn dataField='address'>Register Voters</TableHeaderColumn>
//   </BootstrapTable>
// }
