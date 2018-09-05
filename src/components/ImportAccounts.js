import { Form, Text, Scope } from 'informed'
import React from 'react'
import { Container, Col, Row } from 'mdbreact'
import { isDebtAccount } from '../pages/Home'
import * as accounting from 'accounting'
import './ImportAccounts.css'

export default class ImportAccounts extends React.Component {
  render() {
    const { userID, importFunction, fetchFunction } = this.props
    return (
      <div className="import">
        <p className="h5 text-center mb-4">Step 3: Enter Debt Details</p>
        <Container>
          <Row>
            <Col md="12">
              <Form
                id="import-form"
                onSubmit={values =>
                  importFunction(values, userID).then(result =>
                    fetchFunction(userID)
                  )
                }
              >
                {({ formApi }) => (
                  <div className="import-form">
                    {this.props.accounts
                      .filter(account => {
                        return isDebtAccount(account)
                      })
                      .map((account, index, array) => {
                        return (
                          <div
                            className="import-form-account"
                            key={'accounts[' + index + ']'}
                          >
                            <Scope scope={'accounts[' + index + ']'}>
                              <div className="account-left">
                                <Text
                                  field="id"
                                  id={'account-' + index + '-id'}
                                  key={'account-' + index + '-id'}
                                  initialValue={account.id}
                                  type="hidden"
                                />
                                <Text
                                  field="balance"
                                  id={'account-' + index + '-balance'}
                                  key={'account-' + index + '-balance'}
                                  initialValue={account.balance / -1000}
                                  type="hidden"
                                />
                                <Text
                                  field="name"
                                  id={'account-' + index + '-name'}
                                  key={'account-' + index + '-name'}
                                  initialValue={account.name}
                                  type="hidden"
                                />
                                <div>{account.name}</div>
                                <div className="balance">
                                  {accounting.formatMoney(
                                    account.balance / -1000
                                  )}
                                </div>
                              </div>
                              <div className="account-right">
                                <div>
                                  <label
                                    className="import-form-label"
                                    htmlFor={
                                      'account-' + index + '-interestrate'
                                    }
                                  >
                                    Interest Rate
                                  </label>
                                  <Text
                                    field="interestrate"
                                    id={'account-' + index + '-interestrate'}
                                    key={'account-' + index + '-interestrate'}
                                    className={
                                      errorExists(
                                        formApi.getState().errors,
                                        'accounts',
                                        index,
                                        'interestrate'
                                      )
                                        ? 'is-invalid'
                                        : null
                                    }
                                    validate={validateInterestRate}
                                    validateOnBlur
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor={
                                      'account-' + index + '-interestrate'
                                    }
                                  >
                                    Min. Monthly Payment
                                  </label>
                                  <Text
                                    field="minimumpayment"
                                    id={'account-' + index + '-minimumpayment'}
                                    key={'account-' + index + '-minimumpayment'}
                                    className={
                                      errorExists(
                                        formApi.getState().errors,
                                        'accounts',
                                        index,
                                        'minimumpayment'
                                      )
                                        ? 'is-invalid'
                                        : null
                                    }
                                    validate={validateMinimumPayment}
                                    validateOnBlur
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor={
                                      'account-' + index + '-nextduedate'
                                    }
                                  >
                                    Next Due Date
                                  </label>
                                  <Text
                                    field="nextduedate"
                                    id={'account-' + index + '-nextduedate'}
                                    key={'account-' + index + '-nextduedate'}
                                    className={
                                      formApi.getState().errors.nextduedate
                                        ? 'is-invalid'
                                        : null
                                    }
                                    validate={validateDueDate}
                                    validateOnBlur
                                  />
                                </div>
                              </div>
                            </Scope>
                          </div>
                        )
                      })}
                    <button type="submit" className="btn btn-outline-purple">
                      Submit
                    </button>
                  </div>
                )}
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}

const errorExists = (errors, arrayName, index, field) => {
  if (errors && errors[arrayName] && errors[arrayName].length) {
    // console.log('returning ' + arrayName + '-' + index + '-' + field)
    return errors[arrayName][index] ? errors[arrayName][index][field] : false
  }
  return false
}
const interestRateRegex = /[0-9]+(\.[0-9]+)?/
const minimumPaymentRegex = /^[1-9][0-9]*(\.[0-9]{2})?$/

const validateInterestRate = value => {
  return typeof value === 'string'
    ? interestRateRegex.test(value)
      ? null
      : 'Please enter a valid interest rate in %'
    : 'Invalid interest rate input.'
}
const validateMinimumPayment = value => {
  return typeof value === 'string'
    ? minimumPaymentRegex.test(value)
      ? null
      : 'Please enter a valid minimum payment in dollars'
    : 'Invalid minimum payment input.'
}
const validateDueDate = value => {
  return null // check if date is in the future using moment?
}
