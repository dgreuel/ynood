import { Form, Text } from 'informed'
import React from 'react'
import { Container, Col, Row } from 'mdbreact'

export default class Register extends React.Component {
  render() {
    return (
      <div className="register">
        <p className="h5 text-center mb-4">
          Step 2: Register for a YNOOD Account
        </p>
        <Container>
          <Row>
            <Col md="1" />
            <Col md="10">
              <Form
                id="register-form"
                onSubmit={values =>
                  this.props.registrationFunction(
                    values.email,
                    this.props.ynabID,
                    values.budget
                  )
                }
              >
                {({ formApi }) => (
                  <div>
                    <label htmlFor="register-email">Email:</label>
                    <Text
                      field="email"
                      id="register-email"
                      className={
                        formApi.getState().errors.email
                          ? 'is-invalid form-control'
                          : 'form-control'
                      }
                      validate={validateEmail}
                      validateOnBlur
                    />
                    <br />
                    <label htmlFor="register-budget">
                      Monthly debt payoff budget:
                    </label>
                    <Text
                      field="budget"
                      id="register-budget"
                      className={
                        formApi.getState().errors.budget
                          ? 'is-invalid form-control'
                          : 'form-control'
                      }
                      validate={validateBudget}
                      validateOnBlur
                      validateOnChange
                    />
                  </div>
                )}
              </Form>
            </Col>
            <Col md="1" />
          </Row>
          <Row>
            <Col md="1" />
            <Col md="10">
              <button type="submit" className="btn btn-outline-purple">
                Submit
              </button>
            </Col>
            <Col md="1" />
          </Row>
        </Container>
      </div>
    )
  }
}
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const budgetRegex = /^[1-9][0-9]*(\.[0-9]{2})?$/

const validateEmail = value => {
  return typeof value === 'string'
    ? emailRegex.test(value)
      ? null
      : 'Please enter a valid email address'
    : 'Invalid email input.'
}

const validateBudget = value => {
  return typeof value === 'string'
    ? budgetRegex.test(value)
      ? null
      : 'Please enter a valid dollar amount'
    : 'Invalid budget input.'
}
