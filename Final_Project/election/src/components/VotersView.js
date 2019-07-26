import React, { Component } from 'react';
import ElectionWeb3 from '../ElectionLogic';

//UI Components
import ChartsView from './ChartsView'
import ListView from './ListView'
import AccountsSelectionView from './AccountsSelectionView'
import QuestionsAndAnswersView from './QuestionsAndAnswersView'

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import BootstrapTable from 'react-bootstrap-table-next';
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';

//Layout
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

var el = new ElectionWeb3()

export default class VotersView extends Component {
  constructor() {
    super();
    this.state = {
      candidatesNames: [],
      candidatesVotesCount: [],
      candidatesIds: [],
      // Selection For Voting
      selectedCandidates: {value: -1, label: ""},
      candidatesSelectionOptions: [],
      //UI
      myVoterStatus: 0,
      isLoading: true,
      myAccount: "",
      isVotingDatesConfigured: false,
      question: "",
     };


     //Events
     this.contractEvents = this.contractEvents.bind(this);
     //Actions
     this.vote = this.vote.bind(this);
     this.registerAsVoter = this.registerAsVoter.bind(this);
     this.updateState = this.updateState.bind(this);
     this.addQuestion = this.addQuestion.bind(this);
     //Containers
     this.datesContainer = this.datesContainer.bind(this);
     this.candidateImageContainer = this.candidateImageContainer.bind(this);

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
    const candidatesSelectionOptions = candidates.map(
      (x)=>{
        return {
          value: x.id,
          label: `${x.name}, agenda: ${x.agenda}, address: ${x.address}`}
      }
    );

    const voterStatus = await el.voterStatus();
    const votingCoinBalance = await el.votingCoinBalance();
    const isVotingDatesConfigured = await el.isVotingDatesConfigured();
    const account = el.getAccount();
    const startDate = await el.startDate();
    const endDate = await el.endDate();

    this.setState({
      candidates: candidates,
      candidatesIds: candidatesIds,
      candidatesSelectionOptions: candidatesSelectionOptions,
      isLoading: false,
      myVoterStatus: voterStatus,
      myAccount: account,
      isVotingDatesConfigured: isVotingDatesConfigured,
      votingCoinBalance: votingCoinBalance,
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
    this.updateState();
  };

  questionTextChangeEvent = event => {
    this.setState({ question: event.target.value });
  };

  async registerAsVoter() {
    this.setState({ isLoading: true });
    const res = await el.registerAsVoter();
    this.setState({ isLoading: false });
  };

  async vote()  {
    this.setState({ isLoading: true });
    const candidateId = this.state.selectedCandidates.value;
    const res = await el.castVote({candidateId});
    this.setState({ isLoading: false });
  };

  async addQuestion()  {
    this.setState({ isLoading: true });
    const res = await el.addQuestion({ question: this.state.question });
    this.setState({ isLoading: false });
  };


  datesContainer() {
    let datesContainer = <div
    ref="container">
    <Container> <Row><Col> { <h4>Voting Dates Not set yet</h4>} </Col></Row> </Container>
    </div>
    if (this.state.isVotingDatesConfigured) {
      const startDate = this.state.startDate.toLocaleString();
      const endDate = this.state.endDate.toLocaleString();
      datesContainer = <div ref="container">
      <Container>
        <Row>
          <Col> { <h4>Start Voting Date</h4> } </Col>
          <Col> {<h4> {startDate} </h4>} </Col>
        </Row>
        <Row>
          <Col>{<h4> End Voting Date</h4>} </Col>
          <Col>{<h4> {endDate} </h4>}</Col>
        </Row>
      </Container>
      </div>
    }
    return datesContainer
  }

  candidateImageContainer() {

      const candidateIndex = this.state.selectedCandidates.value - 1;
      let candidate = {"image": null}
      if (candidateIndex >= 0 && this.state.candidates.length > candidateIndex) {
        candidate = this.state.candidates[candidateIndex]
      }
      const candidateImage = candidate.image
      if (!candidateImage) {
        return null
      }

      const now = new Date()
      const whileVoting = (this.state.startDate < now) && (this.state.endDate > now);
      const status = parseInt(this.state.myVoterStatus);
      const canVote = (0 < status && status < 3 && whileVoting);
      let votingButtonTitle = "Vote"
      if (this.state.myVoterStatus == 0) {
        votingButtonTitle = "You are not listed as a voter"
      }
      if (!canVote) {
        votingButtonTitle = "You already voted - you can vote only once"
      }

      return  <Container>
        <Card style={{ width: '18rem' }}>
          <Card.Img variant="top" src={candidateImage} />
            <Card.Body>
              <Card.Title>{candidate.name}</Card.Title>
              <Card.Text> {candidate.agenda} </Card.Text>
              <Button variant="primary" disabled={!canVote} onClick={this.vote} > {votingButtonTitle} </Button>
            </Card.Body>
          </Card>
      </Container>

      // return <Col> <Image style={{width: 50, height: 'auto'}} src={candidateImage} roundedCircle /> </Col>
  }
  loaderContainer() {
    if (!this.state.isLoading) {
      return null
    }
    return <div ref="container">
    <Container>
      <Row>
        <Col>
          {
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading... you might need to approve the transaction in your Metamask account</span>
            </Spinner>
          }
        </Col>
      </Row>
    </Container>
    </div>
  }

  render() {
    const status = parseInt(this.state.myVoterStatus);
    const isRegisterAsVoterAlreay = (0 < status)
    return <div ref="container">
    <Container>
      <Row>
        { this.loaderContainer() }
        <Col>
          { <h4>Hello, {this.state.myAccount}!</h4> }
        </Col>
      </Row>
      <Row><Col> {this.datesContainer()} </Col></Row>
      <Row><Col> { <h4>Wallet Balance: {this.state.votingCoinBalance}</h4> }</Col></Row>
      <Row>
        <Col>
        {<h4>Select Candidate:</h4> }
        {
          <ListView
          options={this.state.candidatesSelectionOptions}
          selectedOption={this.state.selectedCandidates}
          handleChange={this.handleCandidateSelectionChange}
          />
        }
        </Col>
      </Row>
      <Row>
        <Col>
          {
            <Button
            variant="primary"
            disabled={isRegisterAsVoterAlreay}
            onClick={this.registerAsVoter}
            >
            {isRegisterAsVoterAlreay ? 'You are in the voters list' : 'Register As Voter'}
            </Button>
          }
        </Col>
      </Row>
      <Row> <Col>{this.candidateImageContainer()} </Col> </Row>
      <Row>
        <Col>
          {
          <Form>
            <Form.Group controlId="formQuestion">
              <Form.Label>Question For All Candidates: </Form.Label>
              <Form.Control
                as="input"
                type="text"
                placeholder="Enter Question"
                value={this.state.question}
                onChange={this.questionTextChangeEvent}
               />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={!this.state.isVotingDatesConfigured}
              onClick={this.addQuestion}
            >
              {'Ask a Quesion'}
            </Button>
          </Form>
          }
        </Col>
      </Row>
      <Row> <Col> <QuestionsAndAnswersView/> </Col></Row>
    </Container>
    </div>
  }
}
