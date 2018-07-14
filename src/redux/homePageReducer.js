import { reduxModule } from 'react-website'

const redux = reduxModule('FRIENDS')

export const fetchFriends = redux.action(
  'FETCH_FRIENDS',
  async ({ http }, force) => {
    return await http.get(`/api`, { force })
  },
  // The fetched friends list will be placed
  // into the `friends` Redux state property.
  'friends'
  //
  // Or write it like this:
  // { friends: result => result }
  //
  // Or write it as a Redux reducer:
  // (state, result) => ({ ...state, friends: result })
)

// This is the Redux reducer which now
// handles the asynchronous action defined above.
export default redux.reducer({ friends: {} })
