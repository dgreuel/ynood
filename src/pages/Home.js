import React, { Component } from 'react'
import { connect } from 'react-redux'
import { meta } from 'react-website'
import {
  fetchBudgets,
  fetchYNABaccounts,
  connectBudgets
} from '../redux/homePageReducer'
import * as accounting from 'accounting'

@meta(() => ({
  title: 'Home!'
}))
@connect(
  ({ homePage }) => connectBudgets(homePage),
  {
    fetchYNABaccounts,
    fetchBudgets
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
    const { fetchBudgets, fetchYNABaccounts } = this.props
    fetchBudgets().then(result => {
      fetchYNABaccounts(result.data.budgets[0].id)
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
    const { fetchYNABaccounts } = this.props
    const selection = document.getElementById('budgetPicker').value
    this.setState({
      selectedBudget: selection
    })
    // console.log(`getting accounts for ${selection}`)
    fetchYNABaccounts(selection)
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
    const { YNABaccounts } = this.props
    if (YNABaccounts && YNABaccounts.data && YNABaccounts.data.accounts) {
      return (
        <table className="accountsTable">
          <tbody>
            {YNABaccounts.data.accounts
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
                  YNABaccounts.data.accounts
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
    const { fetchBudgets, budgets, YNABaccounts } = this.props
    return (
      <div className="accounts">
        <div className="YNABside">
          <h2>YNAB Debt Accounts</h2>
          <div id="budgetPickerDiv">{this.budgetPicker.bind(this)()}</div>
          <div id="YNABaccounts">{this.YNABaccountList.bind(this)()}</div>
          <button
            type="button"
            onClick={() => {
              fetchBudgets()
            }}>
            fetch
          </button>
          <button
            type="button"
            onClick={() => {
              console.log(JSON.stringify(budgets))
              console.log(JSON.stringify(YNABaccounts))
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
