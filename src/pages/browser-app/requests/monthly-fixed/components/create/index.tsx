import React, { FunctionComponent, useState } from 'react'

import './style.scss'
import { bemClass } from '@utils'
import { Breadcrumb, Button, CheckBox, Column, Panel, RadioGroup, Row, SelectInput, Text, TextArea, TextInput } from '@base'
import { MonthlyFixedRequestModel } from '@types'

const blk = 'create-monthly-fixed-request'

interface CreateMonthlyFixedRequestProps {}

const CreateMonthlyFixedRequest: FunctionComponent<CreateMonthlyFixedRequestProps> = () => {
  const [monthlyFixedRequest, setMonthlyFixedRequest] = useState<MonthlyFixedRequestModel>({
    customerDetails: {
      customerId: '',
      customerCategory: '',
    },
    requestDetails: {
      vehicleSelection: 'Existing',
      staffSelection: 'Existing',
      requestType: '',
      pickupLocation: '',
      dropLocation: '',
      pickupDateAndTime: new Date(),
      dropDateAndTime: new Date(),
      openingKm: 0,
      closingKm: 0,
    },
    packageFromProvidedVehicle: undefined,
    otherCharges: {
      toll: {
        charge: 0,
        chargeableToCustomer: false,
      },
      parking: {
        charge: 0,
        chargeableToCustomer: false,
      },
      nightHalt: {
        charge: 0,
        chargeableToCustomer: false,
        includeInDriverSalary: false,
      },
      driverAllowance: {
        charge: 0,
        chargeableToCustomer: false,
        includeInDriverSalary: false,
      },
    },
    advancePayment: {
      advanceFromCustomer: 0,
      advanceToDriver: 0,
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
          New Monthly Fixed Request
        </Text>
        <Breadcrumb
          data={[
            {
              label: 'Home',
              route: '/dashboard',
            },
            {
              label: 'Monthly Fixed Requests',
              route: '/requests/monthly-fixed',
            },
            {
              label: 'New Monthly Fixed Request',
            },
          ]}
        />
      </div>
      <div className={bemClass([blk, 'content'])}>
        <>
          <Panel
            title="Customer Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Customer Category"
                  name="customerCategory"
                  options={[
                    {
                      key: 'Regular',
                      value: 'Regular',
                    },
                    {
                      key: 'Operator',
                      value: 'Operator',
                    },
                  ]}
                  value={monthlyFixedRequest.customerDetails.customerCategory}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      customerDetails: {
                        customerId: monthlyFixedRequest.customerDetails.customerId ?? '',
                        customerCategory: value.customerCategory.toString(),
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
                  label="Customer"
                  name="customerId"
                  options={[
                    {
                      key: 'Ramesh',
                      value: 'Ramesh',
                    },
                    {
                      key: 'Suresh',
                      value: 'Suresh',
                    },
                  ]}
                  value={monthlyFixedRequest.customerDetails.customerId}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      customerDetails: {
                        customerId: value.customerId.toString(),
                        customerCategory: monthlyFixedRequest.customerDetails.customerCategory ?? '',
                      },
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>
          <Panel
            title="Request Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Vehicle Selection"
                  name="vehicleSelection"
                  options={['Regular', 'Existing', 'New']}
                  value={monthlyFixedRequest.requestDetails.vehicleSelection}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        vehicleSelection: value.vehicleSelection,
                      },
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Staff Selection"
                  name="staffSelection"
                  options={['Regular', 'Existing', 'New']}
                  value={monthlyFixedRequest.requestDetails.staffSelection}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        staffSelection: value.staffSelection,
                      },
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Request Type"
                  name="requestType"
                  options={[
                    { key: 'Local', value: 'Local' },
                    { key: 'Out Station', value: 'Out Station' },
                  ]}
                  value={monthlyFixedRequest.requestDetails.requestType}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        requestType: value.requestType?.toString() ?? '',
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
                  label="Pickup Location"
                  name="pickupLocation"
                  value={monthlyFixedRequest.requestDetails.pickupLocation}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        pickupLocation: value.pickupLocation?.toString() ?? '',
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
                  label="Drop Location"
                  name="dropLocation"
                  value={monthlyFixedRequest.requestDetails.dropLocation}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        dropLocation: value.dropLocation?.toString() ?? '',
                      },
                    })
                  }}
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Pickup Date and Time"
                  name="pickupDateAndTime"
                  type="datetime-local"
                  value={monthlyFixedRequest.requestDetails.pickupDateAndTime ? new Date(monthlyFixedRequest.requestDetails.pickupDateAndTime).toISOString().slice(0, 16) : ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        pickupDateAndTime: value.pickupDateAndTime ? new Date(value.pickupDateAndTime) : null,
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
                  label="Dropoff Date and Time"
                  name="dropDateAndTime"
                  type="datetime-local"
                  value={monthlyFixedRequest.requestDetails.dropDateAndTime ? new Date(monthlyFixedRequest.requestDetails.dropDateAndTime).toISOString().slice(0, 16) : ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        dropDateAndTime: value.dropDateAndTime ? new Date(value.dropDateAndTime) : null,
                      },
                    })
                  }}
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Opening Km"
                  name="openingKm"
                  type="number"
                  value={monthlyFixedRequest.requestDetails.openingKm ?? ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        openingKm: value.openingKm ? Number(value.openingKm) : null,
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
                  label="Closing Km"
                  name="closingKm"
                  type="number"
                  value={monthlyFixedRequest.requestDetails.closingKm ?? ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        closingKm: value.closingKm ? Number(value.closingKm) : null,
                      },
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>
          <Panel
            title="Other Charges"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <div className={bemClass([blk, 'custom-label'])}>
                  <Text
                    tag="p"
                    typography="s"
                    color="gray-darker"
                  >
                    Toll
                  </Text>
                  <CheckBox
                    id="tollChargeableToCustomer"
                    label="Chargeable to customer"
                    checked={monthlyFixedRequest.otherCharges.toll.chargeableToCustomer}
                    changeHandler={value => {
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        otherCharges: {
                          ...monthlyFixedRequest.otherCharges,
                          toll: {
                            ...monthlyFixedRequest.otherCharges.toll,
                            chargeableToCustomer: value.tollChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="toll"
                  placeholder="Toll"
                  value={monthlyFixedRequest.otherCharges.toll.charge}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        toll: {
                          ...monthlyFixedRequest.otherCharges.toll,
                          charge: value.tollCharges ? Number(value.tollCharges) : 0,
                        },
                      },
                    })
                  }}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <div className={bemClass([blk, 'custom-label'])}>
                  <Text
                    tag="p"
                    typography="s"
                    color="gray-darker"
                  >
                    Parking
                  </Text>
                  <CheckBox
                    id="parkingChargeableToCustomer"
                    label="Chargeable to customer"
                    checked={monthlyFixedRequest.otherCharges.parking.chargeableToCustomer}
                    changeHandler={value => {
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        otherCharges: {
                          ...monthlyFixedRequest.otherCharges,
                          parking: {
                            ...monthlyFixedRequest.otherCharges.parking,
                            chargeableToCustomer: value.parkingChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="parking"
                  placeholder="Parking"
                  value={monthlyFixedRequest.otherCharges.parking.charge}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        parking: {
                          ...monthlyFixedRequest.otherCharges.parking,
                          charge: value.parking ? Number(value.parking) : 0,
                        },
                      },
                    })
                  }}
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <div className={bemClass([blk, 'custom-label'])}>
                  <Text
                    tag="p"
                    typography="s"
                    color="gray-darker"
                  >
                    Night Halt
                  </Text>
                  <CheckBox
                    id="nightHaltChargeableToCustomer"
                    label="Chargeable to customer"
                    checked={monthlyFixedRequest.otherCharges.nightHalt.chargeableToCustomer}
                    changeHandler={value => {
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        otherCharges: {
                          ...monthlyFixedRequest.otherCharges,
                          nightHalt: {
                            ...monthlyFixedRequest.otherCharges.nightHalt,
                            chargeableToCustomer: value.nightHaltChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="nightHalt"
                  placeholder="Night Halt"
                  value={monthlyFixedRequest.otherCharges.nightHalt.charge}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        nightHalt: {
                          ...monthlyFixedRequest.otherCharges.nightHalt,
                          charge: value.nightHalt ? Number(value.nightHalt) : 0,
                        },
                      },
                    })
                  }}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Include Night Halt in driver salary?"
                  name="includeNightHaltInDriverSalary"
                  options={['Yes', 'No']}
                  value={monthlyFixedRequest.otherCharges.nightHalt.includeInDriverSalary ? 'Yes' : 'No'}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        nightHalt: {
                          ...monthlyFixedRequest.otherCharges.nightHalt,
                          includeInDriverSalary: value.includeNightHaltInDriverSalary === 'Yes',
                        },
                      },
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <div className={bemClass([blk, 'custom-label'])}>
                  <Text
                    tag="p"
                    typography="s"
                    color="gray-darker"
                  >
                    Driver Allowance
                  </Text>
                  <CheckBox
                    id="driverAllowanceChargeableToCustomer"
                    label="Chargeable to customer"
                    checked={monthlyFixedRequest.otherCharges.driverAllowance.chargeableToCustomer}
                    changeHandler={value => {
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        otherCharges: {
                          ...monthlyFixedRequest.otherCharges,
                          driverAllowance: {
                            ...monthlyFixedRequest.otherCharges.driverAllowance,
                            chargeableToCustomer: value.driverAllowanceChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="driverAllowance"
                  placeholder="Driver Allowance"
                  value={monthlyFixedRequest.otherCharges.driverAllowance.charge}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        driverAllowance: {
                          ...monthlyFixedRequest.otherCharges.driverAllowance,
                          charge: value.driverAllowance ? Number(value.driverAllowance) : 0,
                        },
                      },
                    })
                  }}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Include Driver Allowance in driver salary?"
                  name="includeDriverAllowanceInDriverSalary"
                  options={['Yes', 'No']}
                  value={monthlyFixedRequest.otherCharges.driverAllowance.includeInDriverSalary ? 'Yes' : 'No'}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        driverAllowance: {
                          ...monthlyFixedRequest.otherCharges.driverAllowance,
                          includeInDriverSalary: value.includeDriverAllowanceInDriverSalary === 'Yes',
                        },
                      },
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
            </Row>
          </Panel>
          <Panel
            title="Advance Payment"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Advance from Customer"
                  name="advanceFromCustomer"
                  value={monthlyFixedRequest.advancePayment.advanceFromCustomer}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      advancePayment: {
                        ...monthlyFixedRequest.advancePayment,
                        advanceFromCustomer: value.advanceFromCustomer ? Number(value.advanceFromCustomer) : 0,
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
                  label="Advance to Driver"
                  name="advanceToDriver"
                  value={monthlyFixedRequest.advancePayment.advanceToDriver}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      advancePayment: {
                        ...monthlyFixedRequest.advancePayment,
                        advanceToDriver: value.advanceToDriver ? Number(value.advanceToDriver) : 0,
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
              value={monthlyFixedRequest.comments}
              changeHandler={value => {
                setMonthlyFixedRequest({
                  ...monthlyFixedRequest,
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

export default CreateMonthlyFixedRequest
