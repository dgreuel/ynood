import { Home, isYnabAccountLinked, isYnabAccountSynced } from '../pages/Home'
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
import { mockYnabBudget, mockYnoodAccounts } from './MockData'

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
  let linked,
    synced = null
  expect(home).toBeNull()
  describe('accounts', () => {
    beforeEach(() => {
      home = render(<Home {...props} />)
      linked = null
      synced = null
    })
    afterEach(cleanup)
    describe('isYnabAccountLinked', () => {
      it('should return true if passed a linked YNAB GUID', () => {
        linked = isYnabAccountLinked(
          '4f8978af-dc34-4c45-bfda-5fb82925cb93',
          mockYnoodAccounts
        )
        expect(linked).toBe(true)
      })
      it('should return false if passed an unlinked YNAB GUID', () => {
        linked = isYnabAccountLinked(
          '4f8978af-dc34-4c45-bfda-5fb82925cb93-unlinked',
          mockYnoodAccounts
        )
        expect(linked).toBe(false)
      })
      it('should return false if passed an empty accounts array', () => {
        linked = isYnabAccountLinked('4f8978af-dc34-4c45-bfda-5fb82925cb93', {
          data: { accounts: [] }
        })
        expect(linked).toBe(false)
      })
      it('should return false if accounts===undefined', () => {
        linked = isYnabAccountLinked(
          '4f8978af-dc34-4c45-bfda-5fb82925cb93',
          undefined
        )
        expect(linked).toBe(false)
      })
      it('should return false if accounts===null', () => {
        linked = isYnabAccountLinked(
          '4f8978af-dc34-4c45-bfda-5fb82925cb93',
          null
        )
        expect(linked).toBe(false)
      })
      it('should return false if GUID===null', () => {
        linked = isYnabAccountLinked(null, mockYnoodAccounts)
        expect(linked).toBe(false)
      })
      it('should return false if GUID is a number', () => {
        linked = isYnabAccountLinked(3, mockYnoodAccounts)
        expect(linked).toBe(false)
      })
      it('should return false if GUID is a boolean', () => {
        linked = isYnabAccountLinked(true, mockYnoodAccounts)
        expect(linked).toBe(false)
      })
    })
    describe('isYnabAccountSynced', () => {
      it('should return true if YNAB balance equals YNOOD balance', () => {
        synced = isYnabAccountSynced('4f8978af-dc34-4c45-bfda-5fb82925cb93', {
          ynoodAccounts: mockYnoodAccounts,
          ynabBudget: mockYnabBudget
        })
        expect(synced).toBe(true)
      })
      it('should return false if YNAB balance does not equal YNOOD balance', () => {
        synced = isYnabAccountSynced(
          '4f8978af-dc34-4c45-bfda-5fb82925cb93-unsynced',
          {
            ynoodAccounts: mockYnoodAccounts,
            ynabBudget: mockYnabBudget
          }
        )
        expect(synced).toBe(false)
      })
      it('should return false if account is unlinked', () => {
        synced = isYnabAccountSynced(
          '4f8978af-dc34-4c45-bfda-5fb82925cb93-unlinked',
          {
            ynoodAccounts: mockYnoodAccounts,
            ynabBudget: mockYnabBudget
          }
        )
        expect(synced).toBe(false)
      })
      it('should return false if GUID is null', () => {
        synced = isYnabAccountSynced(null, {
          ynoodAccounts: mockYnoodAccounts,
          ynabBudget: mockYnabBudget
        })
        expect(synced).toBe(false)
      })
      it('should return false if GUID is undefined', () => {
        synced = isYnabAccountSynced(undefined, {
          ynoodAccounts: mockYnoodAccounts,
          ynabBudget: mockYnabBudget
        })
        expect(synced).toBe(false)
      })
      it('should return false if ynoodAccounts is undefined', () => {
        synced = isYnabAccountSynced('4f8978af-dc34-4c45-bfda-5fb82925cb93', {
          ynabBudget: mockYnabBudget
        })
        expect(synced).toBe(false)
      })
      it('should return false if ynabBudget is undefined', () => {
        synced = isYnabAccountSynced('4f8978af-dc34-4c45-bfda-5fb82925cb93', {
          ynoodAccounts: mockYnoodAccounts
        })
        expect(synced).toBe(false)
      })
    })
  })
})
