import React, { FunctionComponent, useState } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { AdvancePaymentModel } from '@types'
import { Breadcrumb, Button, Column, Panel, RadioGroup, Row, SelectInput, Text, TextArea, TextInput } from '@base'

const blk = 'create-advance-payment'

interface Props {}

const CreateAdvancePayment: FunctionComponent<Props> = () => {
  const [advancePayment, setAdvancePayment] = useState<AdvancePaymentModel>({
    staffDetails: {
      staffCategory: '',
      staffId: '',
    },
    paymentDetails: {
      expenseDate: new Date(),
      paymentMode: '',
      amount: 0,
    },
    comments: '',
  })
  const navigateBack = () => {
    // Logic to navigate back to the previous page
    window.history.back()
  }
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          New Advance Payment
        </Text>
        <Breadcrumb
          data={[
            {
              label: 'Home',
              route: '/dashboard',
            },
            {
              label: 'Advance Payments',
              route: '/advance-payment',
            },
            {
              label: 'New Advance Payment',
            },
          ]}
        />
      </div>
      <div className={bemClass([blk, 'content'])}>
        <>
          <Panel
            title="Staff Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Staff Category"
                  name="staffCategory"
                  options={[
                    {
                      key: 'Driver',
                      value: 'Driver',
                    },
                    {
                      key: 'Guide',
                      value: 'Guide',
                    },
                  ]}
                  value={advancePayment.staffDetails.staffCategory ?? ''}
                  changeHandler={value => {
                    setAdvancePayment({
                      ...advancePayment,
                      staffDetails: {
                        staffId: advancePayment.staffDetails.staffId ?? '',
                        staffCategory: value.staffCategory.toString(),
                      },
                    })
                  }}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Staff"
                  name="staffId"
                  options={[
                    {
                      key: 'Driver1',
                      value: 'Driver1',
                    },
                    {
                      key: 'Driver2',
                      value: 'Driver2',
                    },
                  ]}
                  value={advancePayment.staffDetails.staffId}
                  changeHandler={value => {
                    setAdvancePayment({
                      ...advancePayment,
                      staffDetails: {
                        staffId: value.staffId.toString(),
                        staffCategory: advancePayment.staffDetails.staffCategory ?? '',
                      },
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>
          <Panel
            title="Payment Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Expense Date"
                  name="expenseDate"
                  type="date"
                  value={advancePayment.paymentDetails.expenseDate ? new Date(advancePayment.paymentDetails.expenseDate).toISOString().slice(0, 10) : ''}
                  changeHandler={value => {
                    setAdvancePayment({
                      ...advancePayment,
                      paymentDetails: {
                        ...advancePayment.paymentDetails,
                        expenseDate: value.expenseDate ? new Date(value.expenseDate) : null,
                      },
                    })
                  }}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Expense Amount"
                  name="amount"
                  type="number"
                  value={advancePayment.paymentDetails.amount ?? ''}
                  changeHandler={value => {
                    setAdvancePayment({
                      ...advancePayment,
                      paymentDetails: {
                        ...advancePayment.paymentDetails,
                        amount: value.amount ? Number(value.amount) : 0,
                      },
                    })
                  }}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Payment Mode"
                  name="paymentMode"
                  options={[
                    {
                      key: 'Cash',
                      value: 'Cash',
                    },
                    {
                      key: 'Card',
                      value: 'Card',
                    },
                    {
                      key: 'Online Transfer',
                      value: 'Online Transfer',
                    },
                  ]}
                  value={advancePayment.paymentDetails.paymentMode}
                  changeHandler={value => {
                    setAdvancePayment({
                      ...advancePayment,
                      paymentDetails: {
                        ...advancePayment.paymentDetails,
                        paymentMode: value.paymentMode?.toString() ?? '',
                      },
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>
          <Panel
            title="Comments"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <TextArea
              name="comments"
              className={bemClass([blk, 'margin-bottom'])}
              value={advancePayment.comments}
              changeHandler={value => {
                setAdvancePayment({
                  ...advancePayment,
                  comments: value.comments?.toString() ?? '',
                })
              }}
              placeholder="Enter any additional comments or notes here..."
            />
          </Panel>
        </>
        <div className={bemClass([blk, 'action-items'])}>
          <Button
            size="medium"
            category="default"
            className={bemClass([blk, 'margin-right'])}
            clickHandler={navigateBack}
          >
            Cancel
          </Button>
          <Button
            size="medium"
            category="primary"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateAdvancePayment
