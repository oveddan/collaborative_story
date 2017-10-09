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

const buildNumberText = number => `${number}. `

const appendNumber = (text, number) => {
  const numberText = buildNumberText(number)
  return `${numberText}${text.substring(numberText.length, text.length)}`
}

const stripNumber = (text, number) => {
  const numberText = buildNumberText(number)
  return text.substring(numberText.length, text.length)
}

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
  handleStoryLineFocus= this.handleStoryLineFocus.bind(this)

  componentDidMount() {
    this.startNextStoryPrompt()
    window.setTimeout(() => {
      scrollToBottom()
    }, 500)
  }

  textHasBeenEntered() {
    const numberText = buildNumberText(this.state.storyLines.length)
    return this.state.currentStoryLine.length > numberText.length
  }

  handleStoryLineChange(e) {
    this.setState({
      currentStoryLine: appendNumber(e.target.value, this.state.storyLines.length + 1)
    })
  }

  handleStoryLineSubmit() {
    let storyLines

    if (this.state.currentStoryLine !== '')
      storyLines = [...this.state.storyLines, stripNumber(this.state.currentStoryLine, this.state.storyLines.length)]
    else
      storyLines = this.state.storyLines

    window.clearInterval(this.timeLeftInterval)

    this.setState({
      storyLines,
      currentStoryLine: '',
      submitted: true,
      secondsLeftToSubmit: null,
      showNewStoryLine: false
    })

    window.setTimeout(() => {
      this.setState({
        showNewStoryLine: true
      })
    }, 100)

    window.setTimeout(() => {
      this.startNextStoryPrompt()
      scrollToBottom()
    }, POST_SUBMIT_DELAY)


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

  handleStoryLineFocus() {
    if (this.state.currentStoryLine === '')
      this.setState({
        currentStoryLine: `${this.state.storyLines.length + 1}. `
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
              if (this.state.showAll)
                return <li className='list-group-item'>{`${i + 1}. ${storyLine}`}</li>
              if (i === this.state.storyLines.length - 1)
                return (
                  <li
                    key={i}
                    className={`list-group-item list-group-item-info slider ${(cx({open: this.state.showNewStoryLine}))}`}>
                    {`${i + 1}. ${storyLine}`}
                  </li>
                )
              return <li className='list-group-item' key={i}>{`${i + 1}. ......`}</li>
            })}
            <li className='list-group-item'>
              <form>
                <FormGroup controlId='story_line'>
                  {!this.state.submitted && (
                    <textarea autoFocus
                      value={this.state.currentStoryLine}
                      placeholder={`${this.state.storyLines.length + 1}. Continue the story for the future of ${this.state.topic}`}
                      className='form-control'
                      onChange={this.handleStoryLineChange}
                      rows='3'
                      onFocus={this.handleStoryLineFocus}
                    />
                  )}
                  {this.state.submitted && (
                    <div>
                      <span className="label label-success" style={{fontSize: '100%'}}>Your line has been added to the story!</span>
                      <br/>
                      <br/>
                      <span className="label label-info" style={{fontSize: '100%'}}>Please pass this back to the person behind you</span>
                    </div>
                  )}
                </FormGroup>
                {!this.state.submitted && (
                  <div style={{textAlign: 'right'}}>
                    {this.state.secondsLeftToSubmit > 0 && (
                      <span style={{padding: '6px 12px'}}>
                        {`${this.state.secondsLeftToSubmit} seconds remaining`}
                      </span>
                    )}
                    <button className='btn btn-large btn-primary'
                      onClick={this.handleStoryLineSubmit}
                      disabled={!this.textHasBeenEntered()}
                      ref={submitButton => this.submitButton = submitButton}
                    >
                      {`Add to the story`}
                    </button>
                  </div>
                )}
              </form>
            </li>
          </ListGroup>
        </div>
      </div>
    );
  }
}

export default App;
