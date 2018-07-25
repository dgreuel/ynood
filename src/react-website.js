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
    url: path => {
      if (path.indexOf('~api') !== -1) {
        //Undebt.it API
        return `https://undebt.it${path}?id=${localStorage.getItem(
          'ynoodUserID'
        )}&key=${localStorage.getItem(
          'ynoodAppKey'
        )}&verify=${localStorage.getItem('ynoodVerifyString')}`
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
      return getCookie('ynabAccessToken')
    }
  },
  errorState: error => {
    console.log(error)
  }
}
