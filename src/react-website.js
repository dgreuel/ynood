// React-router v3 routes
import routes from './routes'

// Redux reducers
// (they will be combined into the
//  root Redux reducer via `combineReducers()`)
import * as reducer from './redux/index'

export default {
  routes,
  reducer,
  http: {
    url: path => `https://api.youneedabudget.com/v1${path}`
  },
  authentication: {
    accessToken(getCookie, { store, path, url }) {
      // (check the `url` to make sure the access token
      //  is not leaked to a third party)
      return getCookie('accessToken')
    }
  }
}
