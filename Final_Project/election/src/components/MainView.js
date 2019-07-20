import React, { Component } from 'react';
import ElectionWeb3 from '../ElectionLogic';
//UI
import VotersView from './VotersView';
import AdminsView from './AdminsView';
import VoteEndedView from './VoteEndedView';


import Spinner from 'react-bootstrap/Spinner';

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
    this.setState({isAdmin: isAdmin, isLoading: false})
  }

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
    if (true/*this.state.hasVotingEnded*/) {
      return <div ref="container"> <VoteEndedView/> </div>;
    }

    if (this.state.isAdmin) {
      return <div ref="container"> <AdminsView/> </div>
    } else {
      return <div ref="container"> <VotersView/> </div>
    }
  }
}
