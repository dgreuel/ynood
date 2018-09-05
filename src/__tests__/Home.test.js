import { Home } from '../pages/Home'
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'

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
  let home
  beforeEach(() => {
    home = render(<Home {...props} />)
  })
  afterEach(cleanup)
  it('should render correctly', () => {
    expect(home).toMatchSnapshot()
  })
})
