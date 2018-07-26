import { reduxModule } from 'react-website'
import * as _ from 'lodash'
const redux = reduxModule('budgets')

export const fetchBudgetList = redux.action(
  'FETCH_Budgets',
  async ({ http }) => {
    const allBudgets = await http.get(`/budgets`)
    const testBudget = _.filter(allBudgets.data.budgets, budget => {
      return budget.name === 'test'
    })
    return { data: { budgets: testBudget } }
  },
  // The fetched Budgets list will be placed
  // into the `Budgets` Redux state property.
  {
    budgets: result => result
  }
  //
  // Or write it like this:
  // { Budgets: result => result }
  //
  // Or write it as a Redux reducer:
  // (state, result) => ({ ...state, Budgets: result })
)
export const fetchBudget = redux.action(
  'FETCH_YNAB_budget',
  async ({ http }, budgetID, serverKnowledge) => {
    if (!serverKnowledge) {
      const existingBudgets = JSON.parse(localStorage.getItem('YNABbudgets'))
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
  // The fetched budget will be placed
  // into the `YNABbudget` Redux state property.

  //   'YNABbudget'
  // )
  //
  // Or write it like this:
  // { Budgets: result => result }
  //
  // Or write it as a Redux reducer:
  // (state, result) => ({ ...state, Budgets: result })
  // { YNABbudget: (state, result) => ({ ...state, YNABbudget: result }) }
  {
    YNABbudget: result => {
      // console.log(result)
      const cachedBudgets = JSON.parse(localStorage.getItem('YNABbudgets'))
        ? JSON.parse(localStorage.getItem('YNABbudgets'))
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
        localStorage.setItem('YNABbudgets', JSON.stringify(newCachedBudgets))
      }
      return updatedBudget
    }
  }
)

export const fetchYNOODaccounts = redux.action(
  'FETCH_YNOOD_accounts',
  async ({ http }) => {
    const response = await http.get(`/~api/v2/getaccounts`)
    // console.log(response)
    const regex = RegExp('<pre>([\\s\\S]+)</pre>', 'm')
    const matchArray = regex.exec(response)
    // console.log(matchArray)
    return JSON.parse(matchArray[1])
  },
  // The fetched Budgets list will be placed
  // into the `Budgets` Redux state property.
  'ynoodAccounts'
  //
  // Or write it like this:
  // { Budgets: result => result }
  //
  // Or write it as a Redux reducer:
  // (state, result) => ({ ...state, Budgets: result })
)

export const updateYnoodAccountBalance = redux.action(
  'UPDATE_YNOOD_account_balance',
  async ({ http }, debtID, balance) => {
    const response = await http.get(
      `/~api/v2/updateaccount?acct_id=${debtID}&element=balance&value=${balance}`
    )
    // console.log(response)
    const regex = RegExp('<pre>([\\s\\S]+)</pre>', 'm')
    const matchArray = regex.exec(response)
    // console.log(matchArray)
    return JSON.parse(matchArray[1])
  },
  'ynoodAccountUpdateResult'
)

// This is the Redux reducer which now
// handles the asynchronous action defined above.

// A little helper for Redux `@connect()`
export const connectBudgets = redux.getProperties

const initialState = {
  budgets: {},
  YNABbudget: {},
  ynoodAccounts: {},
  updatedYnoodAccount: {}
}

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default redux.reducer(initialState)
