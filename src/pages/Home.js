import React, { Component } from 'react'
import { connect } from 'react-redux'
import { meta } from 'react-website'
import {
  fetchBudgetList,
  fetchBudget,
  connectBudgets,
  fetchYNOODaccounts
} from '../redux/homePageReducer'
import * as accounting from 'accounting'

@meta(() => ({
  title: 'Home!'
}))
@connect(
  ({ homePage }) => connectBudgets(homePage),
  {
    fetchBudgetList,
    fetchBudget,
    fetchYNOODaccounts
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
    const { budgets } = this.props
    if (budgets && budgets.data && budgets.data.budgets) {
      return (
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
                (account1, account2) => (account1.name < account2.name ? -1 : 1)
              )
              .map((account, index) => (
                <tr
                  key={account.id}
                  className={
                    (index % 2 === 0 ? 'greyBackground' : '') + ' balances'
                  }>
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
                </tr>
              ))}
            <tr key="total">
              <td className="accountSummary">Total:</td>
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
                  account1.nickname < account2.nickname ? -1 : 1
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
                </tr>
              ))}
            <tr key="total">
              <td className="accountSummary">Total:</td>
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
    const { budgets, YNABbudget, ynoodAccounts } = this.props
    return (
      <div className="accounts">
        <div className="YNABside">
          <h2>YNAB Debt Accounts</h2>
          <div id="budgetPickerDiv">{this.budgetPicker.bind(this)()}</div>
          <div id="YNABbudget">{this.YNABaccountList.bind(this)()}</div>
          <button
            type="button"
            onClick={() => {
              console.log(JSON.stringify(budgets))
              console.log(JSON.stringify(YNABbudget))
              console.log(JSON.stringify(ynoodAccounts))
            }}>
            log
          </button>
        </div>
        <div className="YNOODside">
          <h2>YNOOD Accounts</h2>
          <div id="YNOODaccounts">{this.YNOODaccountList.bind(this)()}</div>
        </div>
      </div>
    )
  }
}
