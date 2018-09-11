import { Home } from '../pages/Home'
import React from 'react'
import 'jest-dom/extend-expect'
import renderer from 'react-test-renderer'

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

let tree

describe('Home page', () => {
  beforeAll(() => {
    tree = renderer.create(<Home {...props} />)
  })

  it('should render correctly', () => {
    console.log(tree)
    expect(tree).toMatchSnapshot()
  })
})
