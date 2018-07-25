import { reduxModule } from 'react-website'
import * as _ from 'lodash'
const redux = reduxModule('budgets')

export const fetchBudgetList = redux.action(
  'FETCH_Budgets',
  async ({ http }) => {
    return await http.get(`/budgets`)
  },
  // The fetched Budgets list will be placed
  // into the `Budgets` Redux state property.
  'budgets'
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

// This is the Redux reducer which now
// handles the asynchronous action defined above.

// A little helper for Redux `@connect()`
export const connectBudgets = redux.getProperties

const initialState = {
  budgets: {},
  YNABbudget: JSON.parse(localStorage.getItem('YNABbudget'))
    ? JSON.parse(localStorage.getItem('YNABbudget'))
    : {}
}

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default redux.reducer(initialState)
