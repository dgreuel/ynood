import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  fetchYnabUser,
  fetchBudgetList,
  fetchBudget,
  connectBudgets,
  registerYnoodUser,
  saveNewYnoodUser,
  fetchYnoodUserUniqueID,
  createYnoodAccounts,
  deleteYnoodUser,
  fetchYnoodUser,
  fetchYnoodAccounts,
  updateYnoodAccountBalance,
  linkYnoodAccountToYnabAccount,
  setHoveredOverAccount
} from '../redux/homePageReducer'
import {
  isYnabAccountLinked,
  isYnabAccountSynced,
  isYnoodAccountLinked,
  syncYnabAccount,
  isDebtAccount
} from './Accounts'
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
import IoLogOut from 'react-icons/lib/io/log-out'
import * as queryString from '../deps/query-string'
import { DotLoader, BeatLoader } from 'react-spinners'
import moment from 'moment'
import Register from './Register'
import ImportAccounts from './ImportAccounts'

export class Home extends Component {
  constructor() {
    super()
    this.state = {
      selectedBudget: '',
      linkingAccounts: {
        leftToRight: false,
        rightToLeft: false,
        accountToLink: ''
      },
      ynabToken: this.findYnabToken()
    }
  }
  registerForYnood(email, ynabID) {
    const {
      registerYnoodUser,
      saveNewYnoodUser,
      fetchYnoodUser,
      fetchYnoodAccounts,
      fetchYnoodUserUniqueID
    } = this.props
    registerYnoodUser(email, ynabID)
      .then(result => {
        if (result && result.userExists) {
          throw new Error('user exists already')
        }
        if (result && result.newUser && !result.newUser.success) {
          throw new Error('error creating user')
        }
        if (result && result.newUser) {
          console.log(`new user: ${JSON.stringify(result.newUser)}`)
          saveNewYnoodUser(result.newUser)
          fetchYnoodUser(ynabID).then(result => {
            this.setState({ ynoodUser: result })
            fetchYnoodAccounts(this.state.ynoodUser.undebt_user_id).then(
              fetchYnoodUserUniqueID(this.state.ynoodUser.verify_key)
            )
          })
        }
      })
      .catch(err => {
        console.log(err)
        // if (err.message === 'user exists already') {
        // deleteYnoodUser(ynabID).then(response => {
        //   if (response.success) {
        //     console.log(`deleted user ${ynabID}`)
        //   } else {
        //     console.log('couldnt delete user')
        //   }
        // })
      })
  }
  componentDidMount() {
    const {
      fetchYnabUser,
      fetchBudgetList,
      fetchBudget,
      fetchYnoodAccounts,
      fetchYnoodUserUniqueID,
      fetchYnoodUser
    } = this.props

    if (this.state.ynabToken) {
      let ynabID = null
      fetchYnabUser()
        .then(result => {
          if (result && result.data && result.data.user) {
            ynabID = result.data.user.id
            return fetchYnoodUser(ynabID)
          } else {
            throw new Error('unable to fetch user')
          }
        })
        .then(result => {
          if (result && result.undebt_user_id) {
            fetchYnoodAccounts(result.undebt_user_id)
            fetchYnoodUserUniqueID(result.verify_key)
          } else {
            //wait for user to register
          }
        })

      fetchBudgetList().then(result => {
        fetchBudget(result.data.budgets[0].id)
      })
    }
  }
  authorizeWithYnab(e) {
    e.preventDefault()
    const uri = `https://app.youneedabudget.com/oauth/authorize?client_id=${
      process.env.REACT_APP_ynabClientID
    }&redirect_uri=${
      process.env[`REACT_APP_ynabRedirectURI_${process.env.NODE_ENV}`]
    }&response_type=token`
    window.location.replace(uri)
  }

  // Method to find a YNAB token
  // First it looks in the location.hash and then sessionStorage
  findYnabToken() {
    let token = null
    const search = window.location.hash
      .substring(1)
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
    if (search && search !== '') {
      // Try to get access_token from the hash returned by OAuth
      const params = JSON.parse('{"' + search + '"}', function(key, value) {
        return key === '' ? value : decodeURIComponent(value)
      })
      token = params.access_token
      sessionStorage.setItem('ynab_access_token', token)
      window.location.hash = ''
    } else {
      // Otherwise try sessionStorage
      token = sessionStorage.getItem('ynab_access_token')
    }
    return token
  }
  // Clear the token and start authorization over
  resetToken() {
    sessionStorage.removeItem('ynab_access_token')
    this.setState({ ynabToken: null })
  }
  budgetPicker = () => {
    const { budgets, fetchBudgetList, fetchBudgetsPending } = this.props

    if (fetchBudgetsPending) {
      return <BeatLoader align="center" color={'#248f87'} loading={true} />
    }

    if (budgets && budgets.data && budgets.data.budgets) {
      if (budgets.data.budgets.length === 0) {
        return 'no budgets available'
      }
      return (
        <div className="budgetPickerDiv">
          Budget:{' '}
          <select
            id="budgetPicker"
            value={this.state.selectedBudget}
            onChange={this.updateSelectedBudget.bind(this)}
          >
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
            }}
          >
            <MdRefresh />
          </button>
        </div>
      )
    }

    return ''
  }
  updateSelectedBudget = () => {
    const { fetchBudget, ynabBudget } = this.props
    const selection = document.getElementById('budgetPicker').value
    this.setState({
      selectedBudget: selection
    })
    if (ynabBudget) {
      console.log(`getting accounts for ${selection}`)
      console.log(
        `${ynabBudget.data.budget.id ? ynabBudget.data.budget.id : '-'} (${
          ynabBudget.data.budget.name ? ynabBudget.data.budget.name : ''
        })`
      )
    }
    fetchBudget(selection)
  }

  isYnabAccountLinked = (id, { ynoodAccounts } = this.props) => {
    return isYnabAccountLinked(id, ynoodAccounts)
  }
  isYnabAccountSynced = (id, { ynoodAccounts, ynabBudget } = this.props) => {
    return isYnabAccountSynced(id, { ynoodAccounts, ynabBudget })
  }

  isYnoodAccountLinked = (id, { ynoodAccounts, ynabBudget } = this.props) => {
    return isYnoodAccountLinked(id, { ynoodAccounts, ynabBudget })
  }

  syncYnabAccount = (
    id,
    {
      ynoodAccounts,
      ynabBudget,
      updateYnoodAccountBalance,
      fetchYnoodAccounts,
      ynoodUser,
      ynabUser,
      fetchYnoodUser
    } = this.props
  ) => {
    syncYnabAccount(id, {
      ynoodAccounts,
      ynabBudget,
      updateYnoodAccountBalance,
      fetchYnoodAccounts,
      ynoodUser,
      ynabUser,
      fetchYnoodUser
    })
  }

  ynabAccountList = () => {
    const {
      ynabBudget,
      linkYnoodAccountToYnabAccount,
      fetchYnoodAccounts,
      fetchYnabBudgetPending,
      ynoodUser,
      setHoveredOverAccount,
      hoveredOverAccount,
      ynoodAccounts
    } = this.props

    if (fetchYnabBudgetPending) {
      return (
        <div className="spinner">
          <DotLoader size={100} color={'#248f87'} loading={true} />
        </div>
      )
    }
    if (
      ynabBudget &&
      ynabBudget.data &&
      ynabBudget.data.budget.accounts &&
      ynoodAccounts
    ) {
      return (
        <div>
          <table className="accountsTable">
            <tbody>
              {ynabBudget.data.budget.accounts
                .filter(account => {
                  return isDebtAccount(account)
                })
                .sort((account1, account2) => {
                  //console.log(ynoodAccounts)
                  const linkedAccount1 = ynoodAccounts.data
                    ? _.find(
                        ynoodAccounts.data.accounts,
                        ynoodAccount => ynoodAccount.ynab_guid === account1.id
                      )
                    : null
                  const linkedAccount2 = ynoodAccounts.data
                    ? _.find(
                        ynoodAccounts.data.accounts,
                        ynoodAccount => ynoodAccount.ynab_guid === account2.id
                      )
                    : null
                  const payOffDate1 = linkedAccount1
                    ? moment(linkedAccount1.scheduled_payoff_date)
                    : null
                  const payOffDate2 = linkedAccount2
                    ? moment(linkedAccount2.scheduled_payoff_date)
                    : null

                  return payOffDate1 && !payOffDate2
                    ? -1
                    : payOffDate2 && !payOffDate1
                      ? 1
                      : payOffDate1 &&
                        payOffDate2 &&
                        payOffDate1.isAfter(payOffDate2)
                        ? 1
                        : payOffDate1 &&
                          payOffDate2 &&
                          payOffDate1.isBefore(payOffDate2)
                          ? -1
                          : account1.balance < account2.balance
                            ? 1
                            : -1
                })
                .map((account, index) => (
                  <tr
                    key={account.id}
                    className={
                      (index % 2 === 0 ? 'greyBackground' : 'whiteBackground') +
                      (hoveredOverAccount !== null &&
                      account.id !== null &&
                      hoveredOverAccount === account.id &&
                      this.isYnabAccountLinked(account.id)
                        ? ' highlighted'
                        : '')
                    }
                  >
                    <td
                      className={
                        (index % 2 === 0 ? 'greyBackground' : '') +
                        ' accountSummaryLeft'
                      }
                    >
                      {account.name}
                    </td>
                    <td
                      className={
                        (index % 2 === 0 ? 'greyBackground' : '') +
                        ' balancesLeft'
                      }
                    >
                      {accounting.formatMoney(account.balance / 1000)}
                    </td>
                    <td
                      className={
                        (index % 2 === 0 ? 'greyBackground' : '') +
                        ' leftLinkButtons'
                      }
                      onMouseEnter={setHoveredOverAccount.bind(
                        this,
                        account.id
                      )}
                      onMouseLeave={setHoveredOverAccount.bind(this, null)}
                    >
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
                          }`}
                        >
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
                              ynoodUser.undebt_user_id,
                              this.state.linkingAccounts.accountToLink,
                              account.id
                            ).then(result => {
                              if (result.rows_affected === 1) {
                                fetchYnoodAccounts(ynoodUser.undebt_user_id)
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
                          }}
                        >
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
                          }
                        >
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
                          }
                        >
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
                <td colSpan={2} className="total">
                  Linked:
                  <br />
                  Unlinked:
                  <br />
                  Total:
                </td>
                <td className="totalRow">
                  <span style={{ fontWeight: 'normal' }}>
                    {accounting.formatMoney(
                      ynabBudget.data.budget.accounts
                        .filter(account => {
                          return (
                            isDebtAccount(account) &&
                            this.isYnabAccountLinked(account.id)
                          )
                        })
                        .reduce((acc, curr) => {
                          return acc + curr.balance
                        }, 0) / 1000
                    )}
                    <br />
                    {accounting.formatMoney(
                      ynabBudget.data.budget.accounts
                        .filter(account => {
                          return (
                            isDebtAccount(account) &&
                            !this.isYnabAccountLinked(account.id)
                          )
                        })
                        .reduce((acc, curr) => {
                          return acc + curr.balance
                        }, 0) / 1000
                    )}
                    <br />{' '}
                  </span>
                  {accounting.formatMoney(
                    ynabBudget.data.budget.accounts
                      .filter(account => {
                        return isDebtAccount(account)
                      })
                      .reduce((acc, curr) => {
                        return acc + curr.balance
                      }, 0) / 1000
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
    return ''
  }
  YnoodAccountList = () => {
    const {
      ynoodAccounts,
      linkYnoodAccountToYnabAccount,
      fetchYnoodAccounts,
      fetchYnoodAccountsPending,
      ynoodUser,
      setHoveredOverAccount,
      hoveredOverAccount
    } = this.props
    if (fetchYnoodAccountsPending) {
      return (
        <div className="spinner">
          <DotLoader size={100} color={'#248f87'} loading={true} />
        </div>
      )
    }
    if (ynoodAccounts && ynoodAccounts.data && ynoodAccounts.data.accounts) {
      return (
        <div>
          <table className="accountsTable">
            <tbody>
              {ynoodAccounts.data.accounts
                .sort((account1, account2) => {
                  const payOffDate1 = moment(account1.scheduled_payoff_date)
                  const payOffDate2 = moment(account2.scheduled_payoff_date)
                  return payOffDate1.isAfter(payOffDate2)
                    ? 1
                    : payOffDate1.isBefore(payOffDate2)
                      ? -1
                      : account1.current_balance < account2.current_balance
                        ? -1
                        : 1
                })
                .map((account, index) => (
                  <tr
                    key={'YNOOD-debt-' + account.debt_id}
                    className={
                      (index % 2 === 0 ? 'greyBackground' : 'whiteBackground') +
                      (hoveredOverAccount !== null &&
                      account.ynab_guid !== null &&
                      account.ynab_guid !== '\u0000' &&
                      account.ynab_guid.length > 0 &&
                      hoveredOverAccount === account.ynab_guid
                        ? ' highlighted'
                        : '')
                    }
                  >
                    <td
                      className={
                        (index % 2 === 0 ? 'greyBackground' : '') +
                        ' rightLinkButtons'
                      }
                      onMouseEnter={setHoveredOverAccount.bind(
                        this,
                        account.ynab_guid
                      )}
                      onMouseLeave={setHoveredOverAccount.bind(this, null)}
                    >
                      {this.isYnoodAccountLinked.bind(this)(account.debt_id) ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-elegant"
                          onClick={() => {
                            linkYnoodAccountToYnabAccount(
                              ynoodUser.undebt_user_id,
                              account.debt_id,
                              '%00' //URL-encoded null
                            ).then(result => {
                              if (result.rows_affected === 1) {
                                fetchYnoodAccounts(ynoodUser.undebt_user_id)
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
                          }}
                        >
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
                              ynoodUser.undebt_user_id,
                              account.debt_id,
                              this.state.linkingAccounts.accountToLink
                            ).then(result => {
                              if (result.rows_affected === 1) {
                                fetchYnoodAccounts(ynoodUser.undebt_user_id)
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
                          }}
                        >
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
                          }
                        >
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
                          }
                        >
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
                        ' accountSummaryRight'
                      }
                    >
                      {account.nickname}:
                    </td>
                    <td
                      className={
                        (index % 2 === 0 ? 'greyBackground' : '') +
                        ' balancesRight'
                      }
                    >
                      {accounting.formatMoney(account.current_balance)}
                    </td>
                  </tr>
                ))}
              <tr key="total">
                <td colSpan={2} className="total">
                  Linked:
                  <br />
                  Unlinked:
                  <br />
                  Total:
                </td>
                <td className="totalRow">
                  <span style={{ fontWeight: 'normal' }}>
                    {accounting.formatMoney(
                      ynoodAccounts.data.accounts
                        .filter(account =>
                          this.isYnoodAccountLinked(account.debt_id)
                        )
                        .reduce((acc, curr) => {
                          return acc + curr.current_balance
                        }, 0)
                    )}
                    <br />
                    {accounting.formatMoney(
                      ynoodAccounts.data.accounts
                        .filter(
                          account => !this.isYnoodAccountLinked(account.debt_id)
                        )
                        .reduce((acc, curr) => {
                          return acc + curr.current_balance
                        }, 0)
                    )}
                    <br />
                  </span>
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
    return ''
  }
  whenDebtFree = payoff_date => {
    return (payoff_date = moment(payoff_date).fromNow())
  }
  render() {
    return (
      <div className="accounts">
        <div className="ynabSide">
          {!this.state.ynabToken ? (
            <div>
              <p className="h5 text-center mb-4">Step 1: Connect to YNAB</p>
              <button
                className="btn btn-lg btn-default"
                onClick={this.authorizeWithYnab.bind(this)}
              >
                Log In to YNAB
              </button>
              <a href="https://ynab.com/referral/?ref=NJEogaRL6Tux6JIm&utm_source=customer_referral">
                <button className="btn btn-lg btn-elegant">
                  Sign up for YNAB
                </button>
              </a>
            </div>
          ) : (
            <div>
              <h2>YNAB Debt Accounts</h2>
              <div>{this.budgetPicker.bind(this)()}</div>
              <button
                className="btn btn-sm btn-outline-default logout"
                onClick={this.resetToken.bind(this)}
              >
                <span style={{ fontSize: '16px' }}>
                  <IoLogOut />
                </span>
                <span> Log Out</span>
              </button>

              <div id="ynabBudget">{this.ynabAccountList.bind(this)()}</div>
            </div>
          )}
        </div>
        <div className="ynoodSide">
          {this.props.ynoodUser &&
          (this.props.ynoodUserUniqueID || this.props.registeredYnoodUser) ? (
            this.props.ynoodAccounts &&
            this.props.ynoodAccounts.data &&
            this.props.ynoodAccounts.data.accounts.length > 0 &&
            !this.props.fetchYnabBudgetPending ? (
              <div>
                <h2>YNOOD Accounts</h2>
                <div className="login">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      const { verify_key, email } = this.props.ynoodUser
                      const uniqueID =
                        this.props.ynoodUserUniqueID ||
                        this.props.registeredYnoodUser.newUser.uniqueID
                      const query = queryString.stringify({
                        email,
                        verify_key,
                        user_key: uniqueID,
                        key: process.env.REACT_APP_ynoodAppKey,
                        verify: process.env.REACT_APP_ynoodVerifyString
                      })
                      window.open(
                        `https://youneedoutofdebt.com/autologin.php?${query}`,
                        '_blank'
                      )
                    }}
                  >
                    Visit YNOOD Site
                  </button>
                </div>
              </div>
            ) : (
              <ImportAccounts
                accounts={
                  this.props.ynabBudget.data
                    ? this.props.ynabBudget.data.budget.accounts
                    : []
                }
                importFunction={this.props.createYnoodAccounts.bind(this)}
                fetchFunction={this.props.fetchYnoodAccounts.bind(this)}
                userID={
                  this.props.ynoodUser
                    ? this.props.ynoodUser.undebt_user_id
                    : ''
                }
              />
            )
          ) : (
            <div>
              <Register
                registrationFunction={this.registerForYnood.bind(this)}
                ynabID={
                  this.props.ynabUser.data
                    ? this.props.ynabUser.data.user.id
                    : ''
                }
              />
            </div>
          )}

          {this.props.ynoodUser &&
          this.props.ynoodUser.payoff_date &&
          this.props.ynoodAccounts.data &&
          this.props.ynoodAccounts.data.accounts.length > 0 ? (
            <div id="dashboard">
              Debt free{' '}
              {this.whenDebtFree.bind(this)(this.props.ynoodUser.payoff_date)}!
              ({this.props.ynoodUser.payoff_date})
            </div>
          ) : (
            ''
          )}
          <div id="ynoodAccounts">{this.YnoodAccountList.bind(this)()}</div>
        </div>
      </div>
    )
  }
}

export default connect(
  ({ homePage }) => connectBudgets(homePage),
  {
    fetchBudgetList,
    fetchBudget,
    fetchYnoodAccounts,
    updateYnoodAccountBalance,
    linkYnoodAccountToYnabAccount,
    fetchYnabUser,
    fetchYnoodUser,
    registerYnoodUser,
    saveNewYnoodUser,
    fetchYnoodUserUniqueID,
    createYnoodAccounts,
    deleteYnoodUser,
    setHoveredOverAccount
  }
)(Home)
