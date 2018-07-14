import React, { Component } from 'react'
import { connect } from 'react-redux'
import { meta } from 'react-website'
import { fetchFriends } from '../redux/homePageReducer'

@meta(() => ({
  title: 'Home!'
}))
@connect(
  ({ homePage }) => ({
    friends: homePage.friends
  }),
  {
    fetchFriends
  }
)
export default class Basic extends Component {
  render() {
    const { friends, fetchFriends } = this.props
    return (
      <div>
        <div>Yes or No?</div>
        <div className="counter">
          <img src={`${friends.image}`} alt="yes or no?" />
          <button
            type="button"
            onClick={() => {
              fetchFriends('yes')
            }}>
            find out
          </button>
          <button
            type="button"
            onClick={() => {
              console.log(JSON.stringify(friends))
            }}>
            log
          </button>
        </div>
      </div>
    )
  }
}
