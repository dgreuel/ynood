// React-router v3 routes
import routes from './routes'

// Redux reducers
// (they will be combined into the
//  root Redux reducer via `combineReducers()`)
import * as reducer from './redux/index'
import * as queryString from 'query-string'

export default {
  routes,
  reducer,
  http: {
    url: path => {
      if (path.indexOf('~api') !== -1) {
        //Undebt.it API
        const parsedUrl = queryString.parseUrl(`https://undebt.it${path}`)
        parsedUrl.query.id = process.env.REACT_APP_ynoodUserID
        parsedUrl.query.key = process.env.REACT_APP_ynoodAppKey
        parsedUrl.query.verify = process.env.REACT_APP_ynoodVerifyString
        return `${parsedUrl.url}?${queryString.stringify(parsedUrl.query)}`
      }
      return `https://api.youneedabudget.com/v1${path}`
    }
  },
  authentication: {
    accessToken(getCookie, { store, path, url }) {
      // console.log(`reading cookie at ${url}`)
      if (path.indexOf('~api') !== -1) {
        //Undebt.it API
        return null
      }
      return process.env.REACT_APP_ynabAccessToken
    }
  },
  errorState: error => {
    console.log(error)
  }
}
