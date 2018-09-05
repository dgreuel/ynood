import {
  Home,
  isYnabAccountLinked,
  isYnabAccountSynced,
  isYnoodAccountLinked,
  syncYnabAccount,
  isDebtAccount
} from '../pages/Home'
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
import {
  mockYnabBudget,
  mockYnoodAccounts,
  mockYnabUser,
  mockYnoodUser
} from './MockData'

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
  let home, linked, synced
  expect(home).toBeUndefined()
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
    describe('isYnoodAccountLinked', () => {
      it('should return true if passed a linked YNOOD account id', () => {
        linked = isYnoodAccountLinked(1, {
          ynoodAccounts: mockYnoodAccounts,
          ynabBudget: mockYnabBudget
        })
        expect(linked).toBe(true)
      })
      it('should return false if passed an unlinked YNOOD account id', () => {
        linked = isYnoodAccountLinked(3, {
          ynoodAccounts: mockYnoodAccounts,
          ynabBudget: mockYnabBudget
        })
        expect(linked).toBe(false)
      })
      it('should return false if id is null', () => {
        synced = isYnoodAccountLinked(null, {
          ynoodAccounts: mockYnoodAccounts,
          ynabBudget: mockYnabBudget
        })
        expect(synced).toBe(false)
      })
      it('should return false if id is undefined', () => {
        synced = isYnoodAccountLinked(undefined, {
          ynoodAccounts: mockYnoodAccounts,
          ynabBudget: mockYnabBudget
        })
        expect(synced).toBe(false)
      })
      it('should return false if ynoodAccounts is undefined', () => {
        synced = isYnoodAccountLinked(1, {
          ynabBudget: mockYnabBudget
        })
        expect(synced).toBe(false)
      })
      it('should return false if ynabBudget is undefined', () => {
        synced = isYnoodAccountLinked(1, {
          ynoodAccounts: mockYnoodAccounts
        })
        expect(synced).toBe(false)
      })
    })
    describe('syncYnabAccount', () => {
      let mockUpdateYnoodAccountBalance,
        mockFetchYnoodAccounts,
        mockFetchYnoodUser,
        syncYnabAccountParams = null
      beforeEach(() => {
        jest.useFakeTimers()
        mockUpdateYnoodAccountBalance = jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ rows_affected: 1 }))
          .mockReturnValueOnce(Promise.resolve({ rows_affected: 0 }))
          .mockName('mockUpdateYnoodAccountBalance')
        mockFetchYnoodUser = jest
          .fn()
          .mockName('mockFetchYnoodUser')
          .mockReturnValue(mockYnoodUser)
        mockFetchYnoodAccounts = jest
          .fn()
          .mockReturnValueOnce(Promise.resolve(mockYnoodAccounts))
          .mockName('mockFetchYnoodAccounts')
        syncYnabAccountParams = [
          '4f8978af-dc34-4c45-bfda-5fb82925cb93-unsynced',
          {
            ynoodAccounts: mockYnoodAccounts,
            ynabBudget: mockYnabBudget,
            updateYnoodAccountBalance: mockUpdateYnoodAccountBalance,
            fetchYnoodAccounts: mockFetchYnoodAccounts,
            ynoodUser: mockYnoodUser,
            ynabUser: mockYnabUser,
            fetchYnoodUser: mockFetchYnoodUser
          }
        ]
      })
      it('should call updateYnoodAccountBalance once with the right parameters', () => {
        syncYnabAccount(...syncYnabAccountParams)
        expect(mockUpdateYnoodAccountBalance).toHaveBeenCalledTimes(1)
        expect(mockUpdateYnoodAccountBalance).toHaveBeenCalledWith(
          65187,
          2,
          125789
        )
      })
      it('should call fetchYnoodAccounts once with the right parameter', () => {
        expect.assertions(1)
        return syncYnabAccount(...syncYnabAccountParams)
          .then(result => expect(result).toEqual('success'))
          .catch(error => {
            throw new Error(error)
          })
      })
      it('should reject if fetchYnoodAccounts is called twice', () => {
        expect.assertions(1)
        syncYnabAccount(...syncYnabAccountParams)
        return syncYnabAccount(...syncYnabAccountParams)
          .then(result => {})
          .catch(error => {
            expect(error).toEqual('no change was made')
          })
      })

      it('should call fetchYnoodUser once with the right parameter', () => {
        expect.assertions(5)
        return syncYnabAccount(...syncYnabAccountParams)
          .then(result => {
            expect(result).toEqual('success')
            // At this point in time, the callback should not have been called yet
            expect(mockFetchYnoodUser).not.toBeCalled()
            // Fast-forward until all timers have been executed
            jest.runAllTimers()
            // Now our callback should have been called!
            expect(mockFetchYnoodUser).toBeCalled()
            expect(mockFetchYnoodUser).toHaveBeenCalledTimes(1)
            expect(mockFetchYnoodUser).toHaveBeenLastCalledWith(
              'd0160418-7f1c-467a-b9fe-7aa2d1ca37a5'
            )
          })
          .catch(error => {
            throw new Error(error)
          })
      })
    })
    describe('isDebtAccount', () => {
      let account
      beforeEach(() => {
        account = null
      })
      it('should return true if passed a credit card account', () => {
        account = mockYnabBudget.data.budget.accounts[0]
        expect(isDebtAccount(account)).toBe(true)
      })
      it('should return true if passed an otherLiability account', () => {
        account = mockYnabBudget.data.budget.accounts[1]
        expect(isDebtAccount(account)).toBe(true)
      })
      it('should return false if the account is deleted', () => {
        account = _.clone(mockYnabBudget.data.budget.accounts[0])
        account.deleted = true
        expect(isDebtAccount(account)).toBe(false)
      })
      it('should return false if the account is closed', () => {
        account = _.clone(mockYnabBudget.data.budget.accounts[0])
        account.closed = true
        expect(isDebtAccount(account)).toBe(false)
      })
      it('should return false if there is no balance', () => {
        account = _.clone(mockYnabBudget.data.budget.accounts[0])
        account.balance = 0
        expect(isDebtAccount(account)).toBe(false)
      })
      it('should return false if there is a positive balance (credit)', () => {
        account = _.clone(mockYnabBudget.data.budget.accounts[0])
        account.balance = 100
        expect(isDebtAccount(account)).toBe(false)
      })
    })
  })
})
