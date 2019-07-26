import React, { Component } from 'react';
import ElectionWeb3 from '../ElectionLogic';
//UI
import VotersView from './VotersView';
import AdminsView from './AdminsView';
import VoteEndedView from './VoteEndedView';


import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

var el = new ElectionWeb3()


export default class MainView extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      isAdmin: false,
      hasVotingEnded: false,
    }
  }

  async componentWillMount() {
    //TODO - init if needed and update admin state
    this.setState({isLoading: true})
    await el.initWeb3();
    const isAdmin = await el.isAdmin();
    const isElectionEnded = await el.isElectionEnded()
    this.setState({
      hasVotingEnded: isElectionEnded,
       isAdmin: isAdmin,
       isLoading: false
     })
  }

  render() {
    if (this.state.isLoading) {
      return <div ref="container">
        <Container>
          <Row>
            <Col>
              {
                <Spinner animation="border" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>
              }
            </Col>
          </Row>
        </Container>
        </div>
    }
    if (this.state.hasVotingEnded) {
      return <div ref="container"> <VoteEndedView/> </div>;
    }

    if (this.state.isAdmin) {
      return <div ref="container"> <AdminsView/> </div>
    } else {
      return <div ref="container"> <VotersView/> </div>
    }
  }
}
