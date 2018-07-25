import React, { Component } from 'react'
import { connect } from 'react-redux'
import { meta } from 'react-website'
import {
  fetchBudgetList,
  fetchBudget,
  connectBudgets
} from '../redux/homePageReducer'
import * as accounting from 'accounting'

@meta(() => ({
  title: 'Home!'
}))
@connect(
  ({ homePage }) => connectBudgets(homePage),
  {
    fetchBudgetList,
    fetchBudget
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
    const { fetchBudgetList, fetchBudget } = this.props
    fetchBudgetList().then(result => {
      fetchBudget(result.data.budgets[0].id)
    })
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
  render() {
    const { fetchBudgetList, budgets, YNABbudget } = this.props
    return (
      <div className="accounts">
        <div className="YNABside">
          <h2>YNAB Debt Accounts</h2>
          <div id="budgetPickerDiv">{this.budgetPicker.bind(this)()}</div>
          <div id="YNABbudget">{this.YNABaccountList.bind(this)()}</div>
          <button
            type="button"
            onClick={() => {
              fetchBudgetList()
            }}>
            fetch
          </button>
          <button
            type="button"
            onClick={() => {
              console.log(JSON.stringify(budgets))
              console.log(JSON.stringify(YNABbudget))
            }}>
            log
          </button>
        </div>
        <div className="YNOODside">
          <h2>YNOOD Accounts</h2>
        </div>
      </div>
    )
  }
}
