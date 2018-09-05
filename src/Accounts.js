import * as _ from 'lodash'

export const isYnabAccountLinked = (id, ynoodAccounts) => {
  // console.log('checking if Linked')
  return !ynoodAccounts || !ynoodAccounts.data || !ynoodAccounts.data.accounts
    ? false
    : _.find(ynoodAccounts.data.accounts, account => account.ynab_guid === id)
      ? true
      : false
}

export const isYnabAccountSynced = (id, { ynoodAccounts, ynabBudget }) => {
  // console.log('checking if Synced')
  const ynabAccount =
    !ynabBudget || !ynabBudget.data
      ? null
      : _.find(ynabBudget.data.budget.accounts, account => account.id === id)
  let balance = ynabAccount ? ynabAccount.balance : null

  return !ynoodAccounts || !ynoodAccounts.data || !balance
    ? false
    : _.find(ynoodAccounts.data.accounts, account => {
        return (
          account.ynab_guid === id &&
          account.current_balance === balance / -1000
        )
      })
      ? true
      : false
}

export const isYnoodAccountLinked = (id, { ynoodAccounts, ynabBudget }) => {
  const ynabGuid =
    !ynoodAccounts ||
    !ynoodAccounts.data ||
    !ynabBudget ||
    !ynabBudget.data ||
    !id
      ? null
      : _.find(ynoodAccounts.data.accounts, account => account.debt_id === id)
          .ynab_guid
  return ynabGuid === null ||
    ynabGuid === undefined ||
    ynabGuid === '\u0000' ||
    _.find(
      ynabBudget.data.budget.accounts,
      account => account.id === ynabGuid
    ) === null
    ? false
    : true
}

export const syncYnabAccount = (
  id,
  {
    ynoodAccounts,
    ynabBudget,
    updateYnoodAccountBalance,
    fetchYnoodAccounts,
    ynoodUser,
    ynabUser,
    fetchYnoodUser
  }
) => {
  // console.log(`syncing ynab account: ${id}`)

  if (ynoodAccounts && ynoodAccounts.data) {
    const ynabAccount = _.find(
      ynabBudget.data.budget.accounts,
      account => account.id === id
    )
    const linkedYnoodAccount = _.find(
      ynoodAccounts.data.accounts,
      account => account.ynab_guid === id
    )
    const linkedYnoodAccountID = linkedYnoodAccount.debt_id

    return new Promise((resolve, reject) => {
      updateYnoodAccountBalance(
        ynoodUser.undebt_user_id,
        linkedYnoodAccountID,
        ynabAccount.balance / -1000
      )
        .then(result => {
          // console.log(result)
          if (result.rows_affected === 1) {
            fetchYnoodAccounts(ynoodUser.undebt_user_id).then(result => {
              setTimeout(fetchYnoodUser, 30000, ynoodUser.member_number)
              resolve('success')
            })
          } else if (result.rows_affected === 0) {
            reject('no change was made')
          } else {
            reject('an error occurred')
          }
        })
        .catch(error => {
          console.error(error)
          reject(error)
        })
    })
  }
}

export const isDebtAccount = account => {
  return (
    account.deleted === false &&
    account.closed === false &&
    (account.type === 'creditCard' || account.type === 'otherLiability') &&
    account.balance < 0
  )
}
