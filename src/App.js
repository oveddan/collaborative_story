import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { getParams } from './utils'
import { FormGroup, Button, ControlLabel, ListGroup, ListGroupItem } from 'react-bootstrap'
import cx from 'classnames'

const getTopic = () => getParams(document.location.search).topic
const getShowAll = () => getParams(document.location.search).showAll

const POST_SUBMIT_DELAY = 5 * 1000
const SECONDS_PER_SUBMIT = 25

const scrollToBottom = () => window.scrollTo(0,document.body.scrollHeight);

class App extends Component {
  state = {
    topic: getTopic(),
    storyLines: JSON.parse(window.localStorage.getItem(getTopic()) || '[]'),
    showAll: getShowAll() === 'true',
    currentStoryLine: '',
    secondsLeftToSubmit: null
  }

  handleStoryLineChange= this.handleStoryLineChange.bind(this)
  handleStoryLineSubmit= this.handleStoryLineSubmit.bind(this)

  componentDidMount() {
    this.startNextStoryPrompt()
    window.setTimeout(() => {
      scrollToBottom()
    }, 500)
  }

  handleStoryLineChange(e) {
    this.setState({
      currentStoryLine: e.target.value
    })
  }

  handleStoryLineSubmit() {
    let storyLines

    if (this.state.currentStoryLine !== '')
      storyLines = [...this.state.storyLines, this.state.currentStoryLine]
    else
      storyLines = this.state.storyLines

    window.clearInterval(this.timeLeftInterval)

    this.setState({
      storyLines,
      currentStoryLine: '',
      submitted: true,
      secondsLeftToSubmit: null
    })

    window.setTimeout(() => {
      this.startNextStoryPrompt()
    }, POST_SUBMIT_DELAY)


    scrollToBottom()

    window.localStorage.setItem(this.state.topic, JSON.stringify(storyLines))
  }

  startNextStoryPrompt() {
    this.setState({
      submitted: false,
      secondsLeftToSubmit: SECONDS_PER_SUBMIT
    })

    this.timeLeftInterval = window.setInterval(() => {
      this.decrementTimeLeftToSubmit()
    }, 1000)
  }

  decrementTimeLeftToSubmit() {
    const secondsLeftToSubmit  = this.state.secondsLeftToSubmit - 1

    if (secondsLeftToSubmit === 0)
      this.handleStoryLineSubmit()

    this.setState({
      secondsLeftToSubmit
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to The Future</h1>
        </header>
        <div className='container'>
          <h3>
            {`The story about ${this.state.topic}`}
          </h3>
          <ListGroup>
            {this.state.storyLines.map((storyLine, i) => {
              if (i === this.state.storyLines.length - 1 || this.state.showAll)
                return <ListGroupItem bsStyle='info'>{`${i + 1}. ${storyLine}`}</ListGroupItem>
              return <ListGroupItem>{`${i + 1}.......`}</ListGroupItem>
            })}
            <ListGroupItem>
              <form>
                <FormGroup controlId='story_line'>
                  <span style={{display: 'inline-block',  position: 'relative', top: 0}}>{`${this.state.storyLines.length + 1}.`}</span>
                  <textarea autofocus
                    value={this.state.currentStoryLine}
                    placeholder={`Continue the story for the future of ${this.state.topic}`}
                    className='form-control'
                    onChange={this.handleStoryLineChange}
                    rows='3'
                    disabled={this.state.submitted}
                  />
                </FormGroup>
                <button className='btn-large btn-primary'
                  onClick={this.handleStoryLineSubmit}
                  disabled={this.state.currentStoryLine === ''}
                  ref={submitButton => this.submitButton = submitButton}
                >
                  {`Add to the story`}
                </button>
                {this.state.secondsLeftToSubmit && (
                  <span style={{padding: '6px 12px'}}>
                    {`${this.state.secondsLeftToSubmit} seconds remaining`}
                  </span>
                )}
              </form>
            </ListGroupItem>
          </ListGroup>
          {this.state.submitted && (
            <div>
              <span class="label label-success" style={{fontSize: '100%'}}>Your line has been added to the story!</span>
              <br/>
              <span class="label label-info" style={{fontSize: '100%'}}>Please pass this back to the person behind you</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
