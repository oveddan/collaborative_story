import React, { Component } from 'react';
import './App.css';
import { getParams } from './utils'
import { FormGroup, ListGroup } from 'react-bootstrap'
import cx from 'classnames'
import topics from './topics'
import ShowStory from './ShowStory'

const getTopicFromQuery = () => getParams(document.location.search).topic
const getShowStory = () => getParams(document.location.search).show === 'true'


const saveStory = (topic, storyLines) => {
  window.localStorage.setItem(topic, JSON.stringify(storyLines))
}

const getStory = topic => JSON.parse(window.localStorage.getItem(topic) || '[]')

const hasStory = topic => getStory(topic).length > 0

const removeStory = topic => {
  window.localStorage.removeItem(topic)
}

const POST_SUBMIT_DELAY = 5 * 1000
const SECONDS_PER_SUBMIT = 30

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
    storyLines: getStory(getTopicFromQuery()),
    showStory: getShowStory(),
    currentStoryLine: '',
    secondsLeftToSubmit: null
  }

  handleStoryLineChange= this.handleStoryLineChange.bind(this)
  handleStoryLineSubmit= this.handleStoryLineSubmit.bind(this)
  handleStoryLineFocus= this.handleStoryLineFocus.bind(this)
  clearStory= this.clearStory.bind(this)

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

  clearStory() {
    if (window.confirm('Clear the story?')) {
      this.setState({
        storyLines: []
      })

      removeStory(this.state.topic)
    }
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
      if (this.textarea)
        this.textarea.focus()
    }, POST_SUBMIT_DELAY)


    saveStory(this.state.topic, storyLines)
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
          <h1>Choose a story to fill:</h1>
          <ul>
            {Object.keys(topics).map(topicKey => (
              <li><a href={`/collaborative_story?topic=${topicKey}`}>{topicKey}</a></li>
            ))}
          </ul>

          <h1>Show the stories:</h1>
          <ul>
            {Object.keys(topics).filter(topicKey => hasStory(topicKey)).map(topicKey => (
              <li><a href={`/collaborative_story?show=true&topic=${topicKey}`}>{topicKey}</a></li>
            ))}
          </ul>

        </div>

      )

    if (this.state.showStory)
      return <ShowStory storyLines={this.state.storyLines} topic={topics[this.state.topic]} clearStory={this.clearStory} />

    return (
      <div className="App">
        <header className="App-header">
          <img src={topics[this.state.topic].image} className="topic-image" alt="logo" />
        </header>
        <main className='container'>
          <ListGroup>
            {this.state.storyLines.map((storyLine, i) => {
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
                        <span style={{padding: '6px 12px'}} className={`timer ${cx({alert: this.state.secondsLeftToSubmit < 6})}`}>
                          {`${this.state.secondsLeftToSubmit} seconds remaining`}
                        </span>
                      )}
                      <button className='btn btn-large btn-primary'
                        onClick={this.handleStoryLineSubmit}
                        disabled={!this.textHasBeenEntered()}
                        ref={submitButton => this.submitButton = submitButton}
                      >
                        {`Add to the Story`}
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
