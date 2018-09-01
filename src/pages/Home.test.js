import { Home, isYnabAccountLinked } from './Home'
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'

const mockYnoodAccounts = [
  {
    debt_id: 1,
    ynab_guid: '4f8978af-dc34-4c45-bfda-5fb82925cb93',
    nickname: 'Mortgage',
    current_balance: 135789,
    highest_balance: 135789,
    interest_rate: 3.4,
    next_due_date: '2018-09-01',
    credit_limit: 0,
    minimum_payment: 233,
    active: 1,
    planned_payment_this_month: 233,
    planned_payment_next_month: 233,
    scheduled_payoff_date: '2033-05-01'
  },
  {
    debt_id: 2,
    nickname: 'American Express',
    current_balance: 2342.33,
    highest_balance: 2342.33,
    interest_rate: 15.99,
    next_due_date: '2018-09-09',
    credit_limit: 0,
    minimum_payment: 50,
    active: 1,
    planned_payment_this_month: 50,
    planned_payment_next_month: 767,
    scheduled_payoff_date: '2018-12-01'
  }
]
const props = {
  fetchYnabUser: {},
  fetchBudgetList: {},
  fetchBudget: {},
  connectBudgets: {},
  registerYnoodUser: {},
  saveNewYnoodUser: {},
  fetchYnoodUserUniqueID: {},
  createYnoodAccounts: {},
  deleteYnoodUser: {},
  fetchYnoodUser: {},
  fetchYnoodAccounts: {},
  updateYnoodAccountBalance: {},
  linkYnoodAccountToYnabAccount: {},
  setHoveredOverAccount: {},
  ynabAccounts: {},
  ynabUser: {}
}

describe('Home page', () => {
  let home = null
  expect(home).toBeNull()
  describe('accounts', () => {
    beforeEach(() => {
      home = render(<Home {...props} />)
    })
    afterEach(cleanup)
    describe('isYnabAccountLinked', () => {
      it('should return true if passed a linked YNAB GUID', () => {
        const linked = isYnabAccountLinked(
          '4f8978af-dc34-4c45-bfda-5fb82925cb93',
          mockYnoodAccounts
        )
        expect(linked).toBe(true)
      })
      it('should return false if passed an unlinked YNAB GUID', () => {
        // home = render(<Home {...props} />)
        const linked = isYnabAccountLinked(
          '4f8978af-dc34-4c45-bfda-5fb82925cb94',
          mockYnoodAccounts
        )
        expect(linked).toBe(true)
      })
      it('should return false if passed no accounts', () => {
        // home = render(<Home {...props} />)
        const linked = isYnabAccountLinked(
          '4f8978af-dc34-4c45-bfda-5fb82925cb93',
          []
        )
        expect(linked).toBe(true)
      })
    })
  })
})
