import React, { Component } from 'react'
import { connect } from 'react-redux'
import { meta } from 'react-website'
import {
  fetchBudgetList,
  fetchBudget,
  connectBudgets,
  fetchYNOODaccounts,
  updateYnoodAccountBalance,
  linkYnoodAccountToYnabAccount
} from '../redux/homePageReducer'
import * as accounting from 'accounting'
import * as _ from 'lodash'
import MdRefresh from 'react-icons/lib/md/refresh'
import MdSync from 'react-icons/lib/md/sync'
import FaChain from 'react-icons/lib/fa/chain'
import FaCheckCircle from 'react-icons/lib/fa/check-circle'
import FaClose from 'react-icons/lib/fa/close'
import FaChainBroken from 'react-icons/lib/fa/chain-broken'
import FaChevronRight from 'react-icons/lib/fa/chevron-right'
import FaChevronLeft from 'react-icons/lib/fa/chevron-left'

@meta(() => ({
  title: 'Home!'
}))
@connect(
  ({ homePage }) => connectBudgets(homePage),
  {
    fetchBudgetList,
    fetchBudget,
    fetchYNOODaccounts,
    updateYnoodAccountBalance,
    linkYnoodAccountToYnabAccount
  }
)
export default class Basic extends Component {
  constructor() {
    super()
    this.state = {
      selectedBudget: '',
      linkingAccounts: {
        leftToRight: false,
        rightToLeft: false,
        accountToLink: ''
      }
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
        <div className="budgetPickerDiv">
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
            <MdRefresh />
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

  isYnabAccountLinked = id => {
    // console.log('checking if Linked')
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

  isYnabAccountSynced = id => {
    // console.log('checking if Linked')
    const { ynoodAccounts, YNABbudget } = this.props
    const ynabAccount = _.find(
      YNABbudget.data.budget.accounts,
      account => account.id === id
    )
    let balance = null
    if (ynabAccount) {
      balance = ynabAccount.balance
    }
    if (ynoodAccounts && ynoodAccounts.data && balance) {
      return _.find(ynoodAccounts.data.accounts, account => {
        return (
          account.ynab_guid === id &&
          account.current_balance === balance / -1000
        )
      })
        ? true
        : false
    }
    return true
  }

  isYnoodAccountLinked = id => {
    const { ynoodAccounts, YNABbudget } = this.props
    if (ynoodAccounts && ynoodAccounts.data && YNABbudget && YNABbudget.data) {
      const ynabGuid = _.find(
        ynoodAccounts.data.accounts,
        account => account.debt_id === id
      ).ynab_guid
      return ynabGuid === null ||
        ynabGuid === undefined ||
        ynabGuid === '\u0000' ||
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
      const linkedYnoodAccount = _.find(
        ynoodAccounts.data.accounts,
        account => account.ynab_guid === id
      )
      const linkedYnoodAccountID = linkedYnoodAccount.debt_id
      updateYnoodAccountBalance(
        linkedYnoodAccountID,
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
    const {
      YNABbudget,
      linkYnoodAccountToYnabAccount,
      fetchYNOODaccounts
    } = this.props
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
                  account1.balance > account2.balance
                    ? -1
                    : account1.balance < account2.balance
                      ? 1
                      : 0
              )
              .map((account, index) => (
                <tr
                  key={account.id}
                  className={
                    (index % 2 === 0 ? 'greyBackground' : '') + ' balances'
                  }>
                  <td className="linkButtons"> </td>
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
                      (index % 2 === 0 ? 'greyBackground' : '') + ' linkButtons'
                    }>
                    {this.isYnabAccountLinked.bind(this)(account.id) ? (
                      <button
                        type="button"
                        disabled={this.isYnabAccountSynced.bind(this)(
                          account.id
                        )}
                        onClick={this.syncYnabAccount.bind(this, account.id)}
                        className={`btn btn-sm ${
                          this.isYnabAccountSynced.bind(this)(account.id)
                            ? `btn-success`
                            : 'btn-primary'
                        }`}>
                        {this.isYnabAccountSynced.bind(this)(account.id) ? (
                          <span>
                            <span>Synced </span>
                            <span style={{ fontSize: '14px' }}>
                              <FaCheckCircle />
                            </span>
                          </span>
                        ) : (
                          <span>
                            <span>Sync </span>
                            <span style={{ fontSize: '16px' }}>
                              <MdSync />
                            </span>
                          </span>
                        )}
                      </button>
                    ) : this.state.linkingAccounts.rightToLeft ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-info shaky"
                        onClick={() => {
                          linkYnoodAccountToYnabAccount(
                            this.state.linkingAccounts.accountToLink,
                            account.id
                          ).then(result => {
                            if (result.rows_affected === 1) {
                              fetchYNOODaccounts()
                            } else {
                              alert('could not link accounts')
                            }
                            this.setState({
                              linkingAccounts: {
                                rightToLeft: false,
                                leftToRight: false,
                                accountToLink: ''
                              }
                            })
                          })
                        }}>
                        Select
                      </button>
                    ) : this.state.linkingAccounts.accountToLink ===
                    account.id ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          this.setState({
                            linkingAccounts: {
                              rightToLeft: false,
                              leftToRight: false,
                              accountToLink: ''
                            }
                          })
                        }>
                        <span>Cancel </span>
                        <span style={{ fontSize: '15px' }}>
                          <FaClose />
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() =>
                          this.setState({
                            linkingAccounts: {
                              leftToRight: true,
                              accountToLink: account.id
                            }
                          })
                        }>
                        <span>Link </span>
                        <span style={{ fontSize: '15px' }}>
                          <FaChain />
                        </span>
                        <span style={{ fontSize: '13px' }}>
                          <FaChevronRight />
                        </span>
                      </button>
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
    const {
      ynoodAccounts,
      linkYnoodAccountToYnabAccount,
      fetchYNOODaccounts
    } = this.props
    if (ynoodAccounts && ynoodAccounts.data && ynoodAccounts.data.accounts) {
      return (
        <div>
          <div className="budgetPickerDiv" />

          <table className="accountsTable">
            <tbody>
              {ynoodAccounts.data.accounts
                .sort(
                  (account1, account2) =>
                    account1.current_balance < account2.current_balance
                      ? -1
                      : account1.current_balance > account2.current_balance
                        ? 1
                        : 0
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
                        ' linkButtons'
                      }>
                      {this.isYnoodAccountLinked.bind(this)(account.debt_id) ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-elegant"
                          onClick={() => {
                            linkYnoodAccountToYnabAccount(
                              account.debt_id,
                              '%00' //URL-encoded null
                            ).then(result => {
                              if (result.rows_affected === 1) {
                                fetchYNOODaccounts()
                              } else {
                                alert('could not unlink accounts')
                              }
                              this.setState({
                                linkingAccounts: {
                                  rightToLeft: false,
                                  leftToRight: false,
                                  accountToLink: ''
                                }
                              })
                            })
                          }}>
                          <span style={{ fontSize: '13px' }}>
                            <FaChainBroken />
                          </span>
                          <span> Unlink</span>
                        </button>
                      ) : this.state.linkingAccounts.leftToRight ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-info shaky"
                          onClick={() => {
                            linkYnoodAccountToYnabAccount(
                              account.debt_id,
                              this.state.linkingAccounts.accountToLink
                            ).then(result => {
                              if (result.rows_affected === 1) {
                                fetchYNOODaccounts()
                              } else {
                                alert('could not link accounts')
                              }
                              this.setState({
                                linkingAccounts: {
                                  rightToLeft: false,
                                  leftToRight: false,
                                  accountToLink: ''
                                }
                              })
                            })
                          }}>
                          Select
                        </button>
                      ) : this.state.linkingAccounts.accountToLink ===
                      account.debt_id ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            this.setState({
                              linkingAccounts: {
                                rightToLeft: false,
                                leftToRight: false,
                                accountToLink: ''
                              }
                            })
                          }>
                          <span>Cancel </span>
                          <span style={{ fontSize: '15px' }}>
                            <FaClose />
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() =>
                            this.setState({
                              linkingAccounts: {
                                rightToLeft: true,
                                accountToLink: account.debt_id
                              }
                            })
                          }>
                          <span style={{ fontSize: '13px' }}>
                            <FaChevronLeft />
                          </span>
                          <span style={{ fontSize: '15px' }}>
                            <FaChain />
                          </span>
                          <span> Link</span>
                        </button>
                      )}
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
                    <td className="linkButtons"> </td>
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
        </div>
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
