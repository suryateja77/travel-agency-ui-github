import React, { FunctionComponent, useState } from 'react'
import { Breadcrumb, Text, Panel, Row, Column, TextInput, CheckBox, Button, SelectInput, TextArea } from '@base'
import { ExpenseModel } from '@types'
import { bemClass, pathToName } from '@utils'

import './style.scss'

const blk = 'create-expense'

interface CreateExpenseProps {
  category?: string
}

const CreateExpense: FunctionComponent<CreateExpenseProps> = ({ category = '' }) => {
  const [expense, setExpense] = useState<ExpenseModel>({
    expenseDetails: {
      expenseType: '',
      paymentMode: '',
      expenseDate: new Date(),
      expenseAmount: 0,
      location: '',
    },
    vehicleDetails: category === 'vehicle' ? {
      category: '',
      vehicle: '',
    } : undefined,
    staffDetails: category === 'staff' ? {
      category: '',
      staff: '',
    } : undefined,
    comments: '',
  })

  const navigateBack = () => {
    // Route to the ExpenseList page
    window.location.href = `/expenses/${category}`
  }

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          {`New ${pathToName(category)} Expense`}
        </Text>
        <Breadcrumb
          data={[
            {
              label: 'Home',
              route: '/dashboard',
            },
            {
              label: `${pathToName(category)} Expenses`,
              route: `/expenses/${category}`,
            },
            {
              label: `New ${pathToName(category)} Expense`,
            },
          ]}
        />
      </div>
      <div className={bemClass([blk, 'content'])}>
        <Panel title="Expense Details" className={bemClass([blk, 'margin-bottom'])}>
          <Row>
            <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
              <SelectInput
                label="Expense Type"
                name="expenseType"
                options={[
                  { key: 'Fuel', value: 'Fuel' },
                  { key: 'Maintenance', value: 'Maintenance' },
                  { key: 'Insurance', value: 'Insurance' },
                  { key: 'Salary', value: 'Salary' },
                  { key: 'Other', value: 'Other' },
                ]}
                value={expense.expenseDetails.expenseType}
                changeHandler={value => {
                  setExpense({
                    ...expense,
                    expenseDetails: {
                      ...expense.expenseDetails,
                      expenseType: value.expenseType?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
            <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
              <SelectInput
                label="Payment Mode"
                name="paymentMode"
                options={[
                  { key: 'Cash', value: 'Cash' },
                  { key: 'Card', value: 'Card' },
                  { key: 'Online Transfer', value: 'Online Transfer' },
                  { key: 'Cheque', value: 'Cheque' },
                ]}
                value={expense.expenseDetails.paymentMode}
                changeHandler={value => {
                  setExpense({
                    ...expense,
                    expenseDetails: {
                      ...expense.expenseDetails,
                      paymentMode: value.paymentMode?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
            <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
              <TextInput
                label="Expense Date"
                name="expenseDate"
                type="date"
                value={expense.expenseDetails.expenseDate ? new Date(expense.expenseDetails.expenseDate).toISOString().slice(0, 10) : ''}
                changeHandler={value => {
                  setExpense({
                    ...expense,
                    expenseDetails: {
                      ...expense.expenseDetails,
                      expenseDate: value.expenseDate ? new Date(value.expenseDate) : null,
                    },
                  })
                }}
              />
            </Column>
          </Row>
          <Row>
            <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
              <TextInput
                label="Expense Amount"
                name="expenseAmount"
                type="number"
                value={expense.expenseDetails.expenseAmount ?? ''}
                changeHandler={value => {
                  setExpense({
                    ...expense,
                    expenseDetails: {
                      ...expense.expenseDetails,
                      expenseAmount: value.expenseAmount ? Number(value.expenseAmount) : 0,
                    },
                  })
                }}
              />
            </Column>
            <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
              <TextInput
                label="Location"
                name="location"
                value={expense.expenseDetails.location}
                changeHandler={value => {
                  setExpense({
                    ...expense,
                    expenseDetails: {
                      ...expense.expenseDetails,
                      location: value.location?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
          </Row>
        </Panel>

        
        {category === 'vehicle' && (
          <Panel title="Vehicle Details" className={bemClass([blk, 'margin-bottom'])}>
            <Row>
              <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                <SelectInput
                  label="Vehicle Category"
                  name="category"
                  options={[
                    { key: 'Sedan', value: 'Sedan' },
                    { key: 'SUV', value: 'SUV' },
                    { key: 'Bus', value: 'Bus' },
                  ]}
                  value={expense.vehicleDetails?.category ?? ''}
                  changeHandler={value => {
                    setExpense({
                      ...expense,
                      vehicleDetails: {
                        category: value.category?.toString() ?? '',
                        vehicle: expense.vehicleDetails?.vehicle ?? '',
                      },
                    })
                  }}
                />
              </Column>
              <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                <SelectInput
                  label="Vehicle"
                  name="vehicle"
                  options={[
                    { key: 'Car1', value: 'Car1' },
                    { key: 'Car2', value: 'Car2' },
                    { key: 'Bus1', value: 'Bus1' },
                  ]}
                  value={expense.vehicleDetails?.vehicle ?? ''}
                  changeHandler={value => {
                    setExpense({
                      ...expense,
                      vehicleDetails: {
                        category: expense.vehicleDetails?.category ?? '',
                        vehicle: value.vehicle?.toString() ?? '',
                      },
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>
        )}

        {category === 'staff' && (
          <Panel title="Staff Details" className={bemClass([blk, 'margin-bottom'])}>
            <Row>
              <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                <SelectInput
                  label="Staff Category"
                  name="category"
                  options={[
                    { key: 'Driver', value: 'Driver' },
                    { key: 'Guide', value: 'Guide' },
                    { key: 'Manager', value: 'Manager' },
                  ]}
                  value={expense.staffDetails?.category ?? ''}
                  changeHandler={value => {
                    setExpense({
                      ...expense,
                      staffDetails: {
                        category: value.category?.toString() ?? '',
                        staff: expense.staffDetails?.staff ?? '',
                      },
                    })
                  }}
                />
              </Column>
              <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                <SelectInput
                  label="Staff"
                  name="staff"
                  options={[
                    { key: 'Driver1', value: 'Driver1' },
                    { key: 'Driver2', value: 'Driver2' },
                    { key: 'Guide1', value: 'Guide1' },
                  ]}
                  value={expense.staffDetails?.staff ?? ''}
                  changeHandler={value => {
                    setExpense({
                      ...expense,
                      staffDetails: {
                        category: expense.staffDetails?.category ?? '',
                        staff: value.staff?.toString() ?? '',
                      },
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>
        )}

        <Panel title="Comments" className={bemClass([blk, 'margin-bottom'])}>
          <TextArea
            className={bemClass([blk, 'margin-bottom'])}
            name="comments"
            value={expense.comments}
            changeHandler={value => {
              setExpense({
                ...expense,
                comments: value.comments?.toString() ?? '',
              })
            }}
            placeholder="Enter any additional comments or notes here..."
          />
        </Panel>

        <div className={bemClass([blk, 'action-items'])}>
          <Button
            size="medium"
            category="default"
            className={bemClass([blk, 'margin-right'])}
            clickHandler={navigateBack}
          >
            Cancel
          </Button>
          <Button size="medium" category="primary">
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateExpense
