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
    this.textarea.focus()
    this.textarea.setSelectionRange(0, 9999)
  }

  getStoryText() {
    return this.props.storyLines.reduce((acc, storyLine) => (
      `${acc}${storyLine}\n`
    ), `The story for ${this.props.topic.text}:\n\n`)
  }

  render() {
    const { topic, storyLines, clearStory } = this.props
    return (
      <div className='container show-story-lines'>
        <h1>{`The story for ${topic.text}`} </h1>
        <p>
          <a href='#' onClick={e => {e.preventDefault(); this.copyToClipboard()}}>Copy to clipboard</a>
          &nbsp;|&nbsp;
          <a href='#' onClick={e => {e.preventDefault(); this.selectAll()}}>Select All</a>
        </p>
        <textarea ref={textarea => this.textarea = textarea} rows='10' style={{width:'100%'}} value={this.getStoryText()} />

        <div ref={storyLinesHolder => this.storyLinesHolder = storyLinesHolder}>
          {storyLines.map((storyLine, i) => (
            <p key={i}>{storyLine}</p>
          ))}
        </div>

        <p>
          <a href='#' onClick={e => {e.preventDefault(); clearStory()}}>Clear the story</a>
        </p>
      </div>
    )
  }
}
