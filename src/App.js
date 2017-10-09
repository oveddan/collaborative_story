import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { getParams } from './utils'
import { FormGroup, Button, ControlLabel, ListGroup, ListGroupItem } from 'react-bootstrap'

const getTopic = () => getParams(document.location.search).topic

const POST_SUBMIT_DELAY = 5 * 1000
const SECONDS_PER_SUBMIT = 25

class App extends Component {
  state = {
    topic: getTopic(),
    storyLines: JSON.parse(window.localStorage.getItem(getTopic()) || '[]'),
    currentStoryLine: '',
    secondsLeftToSubmit: null
  }

  handleStoryLineChange= this.handleStoryLineChange.bind(this)
  handleStoryLineSubmit= this.handleStoryLineSubmit.bind(this)


  componentDidMount() {
    this.startNextStoryPrompt()
  }

  handleStoryLineChange(e) {
    this.setState({
      currentStoryLine: e.target.value
    })
  }

  handleStoryLineSubmit() {
    const storyLines = [...this.state.storyLines, this.state.currentStoryLine]

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
              if (i === this.state.storyLines.length - 1)
                return <ListGroupItem bsStyle='info'>{storyLine}</ListGroupItem>
              return <ListGroupItem>............</ListGroupItem>
            })}
          </ListGroup>
          <form>
            <FormGroup controlId='story_line'>
              <ControlLabel>{`Continue the story for the future of ${this.state.topic}`}</ControlLabel>
              <textarea value={this.state.currentStoryLine} className='form-control' onChange={this.handleStoryLineChange} rows='3' />
            </FormGroup>
            <Button bsSize='large' bsStyle='primary' onClick={this.handleStoryLineSubmit} disabled={this.state.currentStoryLine === ''}>
              {`Add to the story`}
            </Button>
            {`${this.state.secondsLeftToSubmit} seconds remaining`}
          </form>
        </div>
      </div>
    );
  }
}

export default App;
