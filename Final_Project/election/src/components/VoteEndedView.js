import React, { Component } from 'react';
import ElectionWeb3 from '../ElectionLogic';

import ChartsView from './ChartsView'

import Spinner from 'react-bootstrap/Spinner';

//Layout
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

var el = new ElectionWeb3()

export default class VotersView extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      candidatesNames: [],
      candidatesVotesCount: [],
      candidatesIds: [],
    }
  }

  async componentWillMount() {
    this.setState({isLoading: true})
    await el.initWeb3();
    let candidates = await el.getCandidates()
    candidates = candidates.sort((c1, c2)=> {return c2.voteCount-c1.voteCount})
    const candidatesNames = candidates.map(x => x.name);
    const candidatesVotesCount = candidates.map(x => x.voteCount);
    this.setState({
      candidates: candidates,
      candidatesNames: candidatesNames,
      candidatesVotesCount: candidatesVotesCount,
       isLoading: false,
     })
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
    const winner = this.state.candidatesNames[0];
    return <div ref="container">
    {this.loaderContainer()}
    { <h4>Election has Eneded - Voting Scores</h4> }
    { <h4>The winner is {winner}</h4> }
    {
      < ChartsView
      candidatesNames={this.state.candidatesNames}
      candidatesVotesCount={this.state.candidatesVotesCount}
      />
    }
    </div>
  }
}
