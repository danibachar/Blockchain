import React, { Component } from 'react';
import ElectionWeb3 from '../ElectionLogic';

import ChartsView from './ChartsView'

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
    candidates = candidates.sort((c1, c2)=> parseInt(c1.voteCount) - parseInt(c2.voteCount))
    const candidatesNames = candidates.map(x => x.name);
    const candidatesVotesCount = candidates.map(x => x.voteCount);

    this.setState({
      candidatesNames: candidatesNames,
      candidatesVotesCount: candidatesVotesCount,
       isLoading: false,
     })
  }

  render() {
    const winner = this.state.candidatesNames[0];
    return <div ref="container">
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
