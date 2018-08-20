import { reduxModule } from 'react-website'
import * as _ from 'lodash'
const redux = reduxModule('budgets')

export const fetchYnabUser = redux.action(
  'FETCH_YNAB_USER',
  async ({ http }) => {
    return await http.get('/user')
  },
  'ynabUser'
)
export const fetchBudgetList = redux.action(
  'FETCH_BUDGETS',
  async ({ http }) => {
    const allBudgets = await http.get(`/budgets`)
    const filteredBudgets = _.filter(allBudgets.data.budgets, budget => {
      return true // return budget.name === 'test'
    })
    return { data: { budgets: filteredBudgets } }
  },
  // The fetched budget list will be placed
  // into the `budgets` Redux state property.
  //
  // Or write it like this:
  // { budgets: result => result }
  //
  {
    budgets: result => result
  }
  // Or write it as a Redux reducer:
  // (state, result) => ({ ...state, Budgets: result })
)
export const fetchBudget = redux.action(
  'FETCH_YNAB_BUDGET',
  async ({ http }, budgetID, serverKnowledge) => {
    if (!serverKnowledge) {
      const existingBudgets = JSON.parse(localStorage.getItem('ynabBudgets'))
      if (existingBudgets && existingBudgets[budgetID]) {
        serverKnowledge = existingBudgets[budgetID].data.server_knowledge
      }
    }
    // console.log('server knowledge in reducer:', serverKnowledge)
    let response = await http.get(
      `/budgets/${budgetID}` +
        (serverKnowledge ? `?last_knowledge_of_server=${serverKnowledge}` : '')
    )

    return response
  },

  {
    ynabBudget: result => {
      // console.log(result)
      const cachedBudgets = JSON.parse(localStorage.getItem('ynabBudgets'))
        ? JSON.parse(localStorage.getItem('ynabBudgets'))
        : {}
      const existingBudget =
        cachedBudgets && cachedBudgets[result.data.budget.id]
          ? cachedBudgets[result.data.budget.id]
          : {}
      // console.log(`existingBudget: ${JSON.stringify(existingBudget)}`)
      const arrayMerger = (obj, src) => {
        if (_.isArray(obj)) {
          const newArray = []
          obj.forEach((val, ind) => {
            if (
              _.find(src, (value, index, array) => {
                if (val.id === value.id) {
                  newArray.push(src[index])
                  return true
                }
                return false
              })
            ) {
              //do nothing (new value already pushed)
            } else {
              newArray.push(obj[ind]) //keep the old value
            }
          })
          return newArray
        }
      }
      const updatedBudget =
        existingBudget.data && result && result.data
          ? _.mergeWith(existingBudget, result, arrayMerger)
          : result
      // console.log('updatedBudget:', updatedBudget)
      if (updatedBudget) {
        const newCachedBudgets = Object.assign({}, cachedBudgets)
        newCachedBudgets[result.data.budget.id] = updatedBudget
        localStorage.setItem('ynabBudgets', JSON.stringify(newCachedBudgets))
      }
      return updatedBudget
    }
  }
)

export const fetchYnoodUser = redux.action(
  'FETCH_YNOOD_USER',
  async ({ http }, ynabID) => {
    const response = await http.get(`/~api/v3/getuser?id=${ynabID}`)
    return JSON.parse(response).info[0]
  },
  'ynoodUser'
)

export const registerYnoodUser = redux.action(
  'REGISTER_YNOOD_USER',
  async ({ http }, email, ynabID, budget = null) => {
    const response = await http.get(
      `/~api/v3/register?email=${email}&cust_id=${ynabID}&budget=${budget}`
    )
    return JSON.parse(response)
  },
  'registeredYnoodUser'
)

export const saveNewYnoodUser = redux.action(
  'SAVE_NEW_YNOOD_USER',
  async ({ http }, data) => {
    const response = await http.post(
      `/api/1/databases/ynood/collections/users`,
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
          authentication: false
        }
      }
    )

    return response
  },
  'savedNewYnoodUser'
)

export const fetchYnoodUserUniqueID = redux.action(
  'FETCH_YNOOD_USER_UNIQUE_ID',
  async ({ http }, verifyKey) => {
    const response = await http.get(
      `/api/1/databases/ynood/collections/users?q={"verify_key": "${verifyKey}"}&fo=true`
    )
    return response ? response.uniqueID : null
  },
  'ynoodUserUniqueID'
)

export const deleteYnoodUser = redux.action(
  'DELETE_YNOOD_USER',
  async ({ http }, ynabID) => {
    const response = await http.get(`/~api/v3/deleteuser?id=${ynabID}`)
    return JSON.parse(response)
  },
  'deletedYnoodUser'
)

export const fetchYnoodAccounts = redux.action(
  'FETCH_YNOOD_ACCOUNTS',
  async ({ http }, undebtID) => {
    const response = await http.get(
      `/~api/v3/getaccounts?id=${undebtID}&active=true`
    )
    // console.log(response)
    return JSON.parse(response)
  },
  'ynoodAccounts'
)

export const updateYnoodAccountBalance = redux.action(
  'UPDATE_YNOOD_ACCOUNT_BALANCE',
  async ({ http }, undebtID, debtID, balance) => {
    const response = await http.get(
      `/~api/v3/updateaccount?id=${undebtID}&acct_id=${debtID}&element=balance&value=${balance}`
    )
    // console.log(response)
    return JSON.parse(response)
  },
  'ynoodAccountUpdateResult'
)

export const linkYnoodAccountToYnabAccount = redux.action(
  'UPDATE_YNOOD_ACCOUNT_LINKED_YNAB_ACCOUNT',
  async ({ http }, undebtID, debtID, ynabAccountID) => {
    const response = await http.get(
      `/~api/v3/updateaccount?id=${undebtID}&acct_id=${debtID}&element=ynab_id&value=${ynabAccountID}`
    )
    // console.log(response)
    return JSON.parse(response)
  },
  'ynoodAccountUpdateResult'
)

export const setHoveredOverAccount = redux.action(
  'SET_HOVERED_OVER_ACCOUNT',
  async ({ http }, accountID) => accountID,
  'hoveredOverAccount'
)

// A little helper for Redux `@connect()`
export const connectBudgets = redux.getProperties

const initialState = {
  budgets: {},
  ynabBudget: {},
  ynoodAccounts: {},
  updatedYnoodAccount: {},
  ynabUser: {},
  ynoodUser: null,
  registeredYnoodUser: {},
  deletedYnoodUser: {},
  ynoodUserUniqueID: null,
  savedNewYnoodUser: null
}

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default redux.reducer(initialState)
