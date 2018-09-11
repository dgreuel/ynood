import { ImportAccounts } from '../components/ImportAccounts'
import React from 'react'
import 'jest-dom/extend-expect'
import { mockYnabBudget, mockYnoodUser } from './MockData'
import renderer from 'react-test-renderer'

describe('ImportAccounts component', () => {
  const mockImportFunction = jest.fn().mockName('mockImportFunction')
  const mockFetchFunction = jest.fn().mockName('mockFetchFunction')
  const props = {
    accounts: mockYnabBudget.data.budget.accounts,
    importFunction: mockImportFunction,
    fetchFunction: mockFetchFunction,
    userID: mockYnoodUser.undebt_user_id
  }
  beforeAll(() => {})

  beforeEach(() => {})

  it('renders correctly', () => {
    const tree = renderer.create(<ImportAccounts {...props} />)
    expect(tree).toMatchSnapshot()
  })
})
