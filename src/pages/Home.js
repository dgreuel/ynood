import React, { Component } from 'react'
import { connect } from 'react-redux'
import { meta } from 'react-website'
import {
  fetchBudgetList,
  fetchBudget,
  connectBudgets,
  fetchYNOODaccounts,
  updateYnoodAccountBalance
} from '../redux/homePageReducer'
import * as accounting from 'accounting'
import * as _ from 'lodash'
import FaRefresh from 'react-icons/lib/fa/refresh'

@meta(() => ({
  title: 'Home!'
}))
@connect(
  ({ homePage }) => connectBudgets(homePage),
  {
    fetchBudgetList,
    fetchBudget,
    fetchYNOODaccounts,
    updateYnoodAccountBalance
  }
)
export default class Basic extends Component {
  constructor() {
    super()
    this.state = {
      selectedBudget: ''
    }
  }
  componentDidMount() {
    const { fetchBudgetList, fetchBudget, fetchYNOODaccounts } = this.props
    fetchBudgetList().then(result => {
      fetchBudget(result.data.budgets[0].id)
    })
    fetchYNOODaccounts()
  }
  budgetPicker = () => {
    const { budgets, fetchBudgetList } = this.props
    if (budgets && budgets.data && budgets.data.budgets) {
      return (
        <div id="budgetPickerDiv">
          Budget:{' '}
          <select
            id="budgetPicker"
            value={this.state.selectedBudget}
            onChange={this.updateSelectedBudget.bind(this)}>
            {budgets.data.budgets.map(budget => (
              <option key={budget.id} value={budget.id}>
                {budget.name}
              </option>
            ))}
          </select>
          <button
            id="refreshYnab"
            type="button"
            onClick={() => {
              fetchBudgetList().then(this.updateSelectedBudget())
            }}>
            <FaRefresh />
          </button>
        </div>
      )
    }
    return 'no budgets available'
  }
  updateSelectedBudget = () => {
    const { fetchBudget, YNABbudget } = this.props
    const selection = document.getElementById('budgetPicker').value
    this.setState({
      selectedBudget: selection
    })
    if (YNABbudget) {
      console.log(`getting accounts for ${selection}`)
      console.log(
        `${YNABbudget.data.budget.id ? YNABbudget.data.budget.id : '-'} (${
          YNABbudget.data.budget.name ? YNABbudget.data.budget.name : ''
        })`
      )
    }
    fetchBudget(selection)
  }
  isDebtAccount = account => {
    return (
      account.deleted === false &&
      account.closed === false &&
      (account.type === 'creditCard' || account.type === 'otherLiability') &&
      account.balance < 0
    )
  }
  isYnabAccountConnected = id => {
    // console.log('checking if connected')
    const { ynoodAccounts } = this.props
    if (ynoodAccounts && ynoodAccounts.data) {
      return _.find(
        ynoodAccounts.data.accounts,
        account => account.ynab_guid === id
      )
        ? true
        : false
    }
    return true
  }

  isYnoodAccountConnected = id => {
    const { ynoodAccounts, YNABbudget } = this.props
    if (ynoodAccounts && ynoodAccounts.data && YNABbudget && YNABbudget.data) {
      const ynabGuid = _.find(
        ynoodAccounts.data.accounts,
        account => account.debt_id === id
      ).ynab_guid
      return ynabGuid === null ||
        ynabGuid === undefined ||
        _.find(
          YNABbudget.data.budget.accounts,
          account => account.id === ynabGuid
        ) === null
        ? false
        : true
    }
    return true
  }
  syncYnabAccount = id => {
    // console.log(`syncing ynab account: ${id}`)
    const {
      ynoodAccounts,
      YNABbudget,
      updateYnoodAccountBalance,
      fetchYNOODaccounts
    } = this.props
    if (ynoodAccounts && ynoodAccounts.data) {
      const ynabAccount = _.find(
        YNABbudget.data.budget.accounts,
        account => account.id === id
      )
      const connectedYnoodAccount = _.find(
        ynoodAccounts.data.accounts,
        account => account.ynab_guid === id
      )
      const connectedYnoodAccountID = connectedYnoodAccount.debt_id
      updateYnoodAccountBalance(
        connectedYnoodAccountID,
        ynabAccount.balance / -1000
      ).then(result => {
        // console.log(result)
        if (result.rows_affected === 1) {
          fetchYNOODaccounts()
        } else {
          console.log('no change was made')
        }
      })
    }
  }
  YNABaccountList = () => {
    const { YNABbudget } = this.props
    if (YNABbudget && YNABbudget.data && YNABbudget.data.budget.accounts) {
      return (
        <table className="accountsTable">
          <tbody>
            {YNABbudget.data.budget.accounts
              .filter(account => {
                return this.isDebtAccount(account)
              })
              .sort(
                (account1, account2) =>
                  account1.balance > account2.name ? -1 : 1
              )
              .map((account, index) => (
                <tr
                  key={account.id}
                  className={
                    (index % 2 === 0 ? 'greyBackground' : '') + ' balances'
                  }>
                  <td className="connectButtons"> </td>
                  <td
                    className={
                      (index % 2 === 0 ? 'greyBackground' : '') +
                      ' accountSummary'
                    }>
                    {account.name}:
                  </td>
                  <td
                    className={
                      (index % 2 === 0 ? 'greyBackground' : '') + ' balances'
                    }>
                    {accounting.formatMoney(account.balance / 1000)}
                  </td>
                  <td
                    className={
                      (index % 2 === 0 ? 'greyBackground' : '') +
                      ' connectButtons'
                    }>
                    {this.isYnabAccountConnected.bind(this)(account.id) ? (
                      <button
                        type="button"
                        onClick={this.syncYnabAccount.bind(this, account.id)}>
                        Sync->
                      </button>
                    ) : (
                      <button type="button">Connect-></button>
                    )}
                  </td>
                </tr>
              ))}
            <tr key="total">
              <td colSpan={2} className="accountSummary">
                Total:
              </td>
              <td className="totalRow">
                {accounting.formatMoney(
                  YNABbudget.data.budget.accounts
                    .filter(account => {
                      return this.isDebtAccount(account)
                    })
                    .reduce((acc, curr) => {
                      return acc + curr.balance
                    }, 0) / 1000
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )
    }
    return 'select a budget to list accounts'
  }
  YNOODaccountList = () => {
    const { ynoodAccounts } = this.props
    if (ynoodAccounts && ynoodAccounts.data && ynoodAccounts.data.accounts) {
      return (
        <table className="accountsTable">
          <tbody>
            {ynoodAccounts.data.accounts
              .sort(
                (account1, account2) =>
                  account1.balance < account2.balance ? -1 : 1
              )
              .map((account, index) => (
                <tr
                  key={'YNOOD-debt-' + account.debt_id}
                  className={
                    (index % 2 === 0 ? 'greyBackground' : '') + ' balances'
                  }>
                  <td
                    className={
                      (index % 2 === 0 ? 'greyBackground' : '') +
                      ' connectButtons'
                    }>
                    {this.isYnoodAccountConnected.bind(this)(
                      account.debt_id
                    ) ? (
                      <button type="button">Disconnect</button>
                    ) : (
                      <button type="button">{`<-Connect`}</button>
                    )}{' '}
                  </td>
                  <td
                    className={
                      (index % 2 === 0 ? 'greyBackground' : '') +
                      ' accountSummary'
                    }>
                    {account.nickname}:
                  </td>
                  <td
                    className={
                      (index % 2 === 0 ? 'greyBackground' : '') + ' balances'
                    }>
                    {accounting.formatMoney(account.current_balance)}
                  </td>
                  <td className="connectButtons"> </td>
                </tr>
              ))}
            <tr key="total">
              <td colSpan={2} className="accountSummary">
                Total:
              </td>
              <td className="totalRow">
                {accounting.formatMoney(
                  ynoodAccounts.data.accounts.reduce((acc, curr) => {
                    return acc + curr.current_balance
                  }, 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )
    }
    return 'no YNOOD accounts found'
  }
  render() {
    return (
      <div className="accounts">
        <div className="YNABside">
          <h2>YNAB Debt Accounts</h2>
          <div>{this.budgetPicker.bind(this)()}</div>

          <div id="YNABbudget">{this.YNABaccountList.bind(this)()}</div>
        </div>
        <div className="YNOODside">
          <h2>YNOOD Accounts</h2>
          <div id="YNOODaccounts">{this.YNOODaccountList.bind(this)()}</div>
        </div>
      </div>
    )
  }
}
