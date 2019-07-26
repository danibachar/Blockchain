import React, { Component } from 'react';
import _ from 'lodash'
import ElectionWeb3 from '../ElectionLogic';

import ListView from './ListView'

import BootstrapTable from 'react-bootstrap-table-next';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';

var el = new ElectionWeb3()


export default class QuestionsAndAnswersView extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      isCandidate: false,
      questions:[],
      selectedQuestion: {value:-1, label:""},
      currQuestion: {},
      answer: {},
      answers: [],
    }

    this.addAnswer = this.addAnswer.bind(this);
    this.handleQuestionSelectionChange = this.handleQuestionSelectionChange.bind(this);

  }

  async componentWillMount() {
    //TODO - init if needed and update admin state
    this.setState({isLoading: true})
    await el.initWeb3();
    await this.updateState()
    this.setState({
      isLoading: false,
      isCandidate: el.isCandidate,
    })
  }

  async updateState() {
    let questions = await el.getQuestions()
    const questionSelectionOptions = questions.map((x)=>{
      return {
        value: x.id,
        label: `${x.question}, num of answers: ${x.answerCounter}`
      }
    });

    let currQuestion = {"answers": []};
    const questionIndex = this.state.selectedQuestion.value-1;
    if (questions.length > questionIndex) {
      currQuestion = questions[questionIndex]
    }
    let answers = []
    if (currQuestion && currQuestion.answers) {
      _.mapKeys(
        currQuestion.answers,
        (value, key) => {answers.push({"id": key, "answer":value})}
      )
    }
    this.setState({
      questions: questions,
      questionSelectionOptions: questionSelectionOptions,
      answersListTitle: (currQuestion && currQuestion.questioner) ? `question asker: ${currQuestion.questioner}` : "",
      answers: answers,
    })
  }

  //MARK: - Answers
  async addAnswer() {
    const answer = this.state.answer.value;
    const questionId = this.state.selectedQuestion.value;
    const res = await el.addAnswer({answer, questionId});
    this.setState({ answer: "" });
  }
  // ref={this.textInput} type="text" onChange={() => this.handleChange()
  handleAnswerSelectionChange = selectedQuestion => {
    const value = this.state.answer.current.value;
    // this.setState({ selectedQuestion });
  };
  //MARK: - Votes
  async handleQuestionSelectionChange(selectedQuestion) {
    this.setState({ selectedQuestion });
    await this.updateState()
  };

  render() {

    return <div ref="container">
    {<h4>Select Question:</h4> }
    {
      <ListView
      options={this.state.questionSelectionOptions}
      selectedOption={this.state.selectedQuestion}
      handleChange={this.handleQuestionSelectionChange}
      />
    }
    {
      (this.state.answers.length > 0) ? <BootstrapTable
      keyField='id'
      data={ this.state.answers }
      columns={ [
        {dataField:'id', text: 'candidateAddress'},
        {dataField: 'answer', text: 'answer' }
      ] }
      /> : null
    }
    {
      this.state.isCandidate ? <Form>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Label>Enter your Answer</Form.Label>
        </Form.Group>
        <Form.Group controlId="asdf">
        <Form.Control ref={inputRef => { this.state.answer = inputRef; }} />
        </Form.Group>
      </Form> : null
    }
    {
      this.state.isCandidate ? <Button
         variant="primary"
         type="submit"
         disabled={false}
         onClick={this.addAnswer}
         >
         {'Answer'}
       </Button> : null
    }
    </div>
  }
}
