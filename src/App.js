import React, { Component } from 'react';
import './App.css';
import { getParams } from './utils'
import { FormGroup, ListGroup } from 'react-bootstrap'
import cx from 'classnames'
import topics from './topics'

const getTopicFromQuery = () => getParams(document.location.search).topic
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
    topic: getTopicFromQuery(),
    storyLines: JSON.parse(window.localStorage.getItem(getTopicFromQuery()) || '[]'),
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

  handleStoryLineSubmit(e) {
    if (e && e.preventDefault)
      e.preventDefault()

    let storyLines

    if (this.textHasBeenEntered())
      storyLines = [...this.state.storyLines, stripNumber(this.state.currentStoryLine, this.state.storyLines.length)]
    else
      storyLines = this.state.storyLines

    window.clearInterval(this.timeLeftInterval)

    this.setState({
      storyLines,
      currentStoryLine: '',
      submitted: true,
      secondsLeftToSubmit: null,
      animateStoryLine: true,
      collapseStoryLine: false
    })

    window.setTimeout(() => {
      this.setState({
        collapseStoryLine: true
      })
    }, 100)

    window.setTimeout(() => {
      this.startNextStoryPrompt()
      scrollToBottom()
      this.textarea.focus()
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
    if (!topics[this.state.topic])
      return (
        <div>
          <div>Invalid topic. Choose a topic</div>
          <ul>
            {Object.keys(topics).map(topicKey => (
              <li><a href={`/collaborative_story?topic=${topicKey}`}>{topicKey}</a></li>
            ))}
          </ul>
        </div>

      )

    return (
      <div className="App">
        <header className="App-header">
          <img src={topics[this.state.topic].image} className="topic-image" alt="logo" />
        </header>
        <main className='container'>
          <ListGroup>
            {this.state.storyLines.map((storyLine, i) => {
              if (this.state.showAll)
                return <li className='list-group-item'>{`${i + 1}. ${storyLine}`}</li>
              if (i === this.state.storyLines.length - 1)
                return (
                  <li
                    key={i}
                    className={`list-group-item list-group-item-info ${(cx({slider: this.state.animateStoryLine, expanded: !this.state.collapseStoryLine}))}`}>
                    {`${i + 1}. ${storyLine}`}
                  </li>
                )
              return <li className='list-group-item' key={i}>{`${i + 1}. ......`}</li>
            })}
            {!this.state.submitted && (
              <li className='list-group-item' key={this.state.storyLines.length}>
                <form>
                  <FormGroup controlId='story_line'>
                    <textarea
                      value={this.state.currentStoryLine}
                      placeholder={`${this.state.storyLines.length + 1}. Continue the story for the future of ${topics[this.state.topic].text}`}
                      className='form-control'
                      onChange={this.handleStoryLineChange}
                      rows='3'
                      onFocus={this.handleStoryLineFocus}
                      ref={textarea => this.textarea = textarea}
                    />
                  </FormGroup>
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
                </form>
              </li>
          )}
          </ListGroup>
          {this.state.submitted && (
            <div>
              <span className="label label-success" style={{fontSize: '100%'}}>Your line has been added to the story!</span>
              <br/>
              <br/>
            </div>
          )}
        </main>
      </div>
    );
  }
}

export default App;
