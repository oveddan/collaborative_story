import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { getParams } from './utils'

const getTopic = () => getParams(document.location.search).topic

class App extends Component {
  state = {
    topic: getTopic(),
    storyLines: JSON.parse(window.localStorage.getItem(getTopic()) || '[]'),
    currentStoryLine: ''
  }

  handleStoryLineChange= this.handleStoryLineChange.bind(this)
  handleStoryLineSubmit= this.handleStoryLineSubmit.bind(this)

  handleStoryLineChange(e) {
    this.setState({
      currentStoryLine: e.target.value
    })
  }

  handleStoryLineSubmit() {
    const storyLines = [...this.state.storyLines, this.state.currentStoryLine]

    this.setState({
      storyLines,
      currentStoryLine: ''
    })

    window.localStorage.setItem(this.state.topic, JSON.stringify(storyLines))
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to The Future</h1>
        </header>
        <p className="App-intro">
          {this.state.topic}
        </p>
        <ul>
          {this.state.storyLines.map(storyLine => (
            <li>{storyLine}</li>
          ))}
        </ul>
        <label>Enter your story:</label>
        <textarea value={this.state.currentStoryLine} onChange={this.handleStoryLineChange} rows='3' style={{width: '90%'}}/>
        <br />
        <input type='submit' onClick={this.handleStoryLineSubmit} disabled={this.state.currentStoryLine === ''} />
      </div>
    );
  }
}

export default App;
