import { Form, Text, Scope } from 'informed'
import React from 'react'
import { Container, Col, Row } from 'mdbreact'

export default class ImportAccounts extends React.Component {
  render() {
    return (
      <div className="import">
        <p className="h5 text-center mb-4">Step 3: Enter Debt Details</p>
        <Container>
          <Row>
            <Col md="12">
              <Form
                id="import-form"
                onSubmit={values => console.log(values)// this.props.importFunction(values)
                }
              >
                {({ formApi }) => (
                  <div>
                    {this.props.accounts.map((account, index, array) => {
                      return (
                        <Scope scope={'accounts[' + index + ']'}>
                          <label htmlFor={'account-' + index + '-interestrate'}>
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
                                ? 'is-invalid form-control'
                                : 'form-control'
                            }
                            validate={validateInterestRate}
                            validateOnBlur
                          />
                          <label htmlFor={'account-' + index + '-nextduedate'}>
                            Next Due Date
                          </label>
                          <Text
                            field="nextduedate"
                            id={'account-' + index + '-nextduedate'}
                            key={'account-' + index + '-nextduedate'}
                            className={
                              formApi.getState().errors.nextduedate
                                ? 'is-invalid form-control'
                                : 'form-control'
                            }
                            validate={validateDueDate}
                            validateOnBlur
                          />
                        </Scope>
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

const validateInterestRate = value => {
  return typeof value === 'string'
    ? interestRateRegex.test(value)
      ? null
      : 'Please enter a valid interest rate in %'
    : 'Invalid interest rate input.'
}

const validateDueDate = value => {
  return null // check if date is in the future using moment?
}
