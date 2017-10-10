import React, { Component }  from 'react'

export default class ShowStory extends Component {
  copyToClipboard = this.copyToClipboard.bind(this)

  copyToClipboard() {
    // const storyLineText = this.props.storyLines.reduce((final, storyLine) => {
      // return final + storyLine + ' '
    // }, '')

    // document.execCommand("copy")
    // this.storyLinesHolder.select()
    // document.execCommand('copy')
    const range = document.createRange();
    range.selectNode(this.storyLinesHolder);
    window.getSelection().addRange(range)
    document.execCommand('copy')
  }

  selectAll() {
    const range = document.createRange();
    range.selectNode(this.storyLinesHolder);
    window.getSelection().addRange(range)
  }

  render() {
    const { topic, storyLines, clearStory } = this.props
    return (
      <div className='container show-story-lines'>
        <br/>
        <p>
          <a href='#' onClick={e => {e.preventDefault(); this.copyToClipboard()}}>Copy to clipboard</a>
        </p>
        <div ref={storyLinesHolder => this.storyLinesHolder = storyLinesHolder}>
          <h1>{`The Story for the Future of ${topic.text}`} </h1>
          {storyLines.map((storyLine, i) => (
            <p key={i}>{storyLine}</p>
          ))}
        </div>

        <br/>
        <p>
          <a href='#' onClick={e => {e.preventDefault(); clearStory()}}>Clear the story</a>
        </p>
      </div>
    )
  }
}
