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
    url: path => `https://www.yesno.wtf${path}`
  }
}
