import { reduxModule } from 'react-website'

const redux = reduxModule('budgets')

export const fetchBudgets = redux.action(
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
export const fetchYNABaccounts = redux.action(
  'FETCH_Ynabaccounts',
  async ({ http }, budgetID) => {
    return await http.get(`/budgets/${budgetID}/accounts`)
  },
  // The fetched Budgets list will be placed
  // into the `Budgets` Redux state property.
  'YNABaccounts'
  //
  // Or write it like this:
  // { Budgets: result => result }
  //
  // Or write it as a Redux reducer:
  // (state, result) => ({ ...state, Budgets: result })
)

// This is the Redux reducer which now
// handles the asynchronous action defined above.

// A little helper for Redux `@connect()`
export const connectBudgets = redux.getProperties

const initialState = {
  budgets: {},
  YNABaccounts: {}
}

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default redux.reducer(initialState)
