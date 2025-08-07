import React, { FunctionComponent, useState } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { AdvanceBookingModel } from '@types'
import { Breadcrumb, Button, Column, Panel, RadioGroup, Row, SelectInput, Text, TextArea, TextInput } from '@base'

const blk = 'create-advance-booking'

interface Props {}

const CreateAdvanceBooking: FunctionComponent<Props> = () => {
  const [advanceBooking, setAdvanceBooking] = useState<AdvanceBookingModel>({
    bookingDetails: {
      customerSelection: 'Existing',
      pickupLocation: '',
      dropLocation: '',
      pickupDateAndTime: new Date(),
      vehicleType: '',
      numberOfSeats: null,
      airConditioning: false,
    },
    customerDetails: {
      customerId: '',
      customerCategory: '',
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
          New Advance Booking
        </Text>
        <Breadcrumb
          data={[
            {
              label: 'Home',
              route: '/dashboard',
            },
            {
              label: 'Advance Bookings',
              route: '/advance-booking',
            },
            {
              label: 'New Advance Booking',
            },
          ]}
        />
      </div>
      <div className={bemClass([blk, 'content'])}>
        <>
          <Panel
            className={bemClass([blk, 'margin-bottom'])}
            title="Booking Details"
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Customer Selection"
                  name="customerSelection"
                  options={['Existing', 'New']}
                  value={advanceBooking.bookingDetails.customerSelection}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      bookingDetails: {
                        ...advanceBooking.bookingDetails,
                        customerSelection: value.customerSelection,
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
                <TextInput
                  label="Pickup Location"
                  name="pickupLocation"
                  value={advanceBooking.bookingDetails.pickupLocation}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      bookingDetails: {
                        ...advanceBooking.bookingDetails,
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
                  value={advanceBooking.bookingDetails.dropLocation}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      bookingDetails: {
                        ...advanceBooking.bookingDetails,
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
                  value={advanceBooking.bookingDetails.pickupDateAndTime ? new Date(advanceBooking.bookingDetails.pickupDateAndTime).toISOString().slice(0, 16) : ''}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      bookingDetails: {
                        ...advanceBooking.bookingDetails,
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
                <SelectInput
                  label="Vehicle Type"
                  name="vehicleType"
                  options={[
                    { key: 'Sedan', value: 'Sedan' },
                    { key: 'Hatchback', value: 'Hatchback' },
                  ]}
                  value={advanceBooking.bookingDetails.vehicleType}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      bookingDetails: {
                        ...advanceBooking.bookingDetails,
                        vehicleType: value.vehicleType?.toString() ?? '',
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
                  label="Number of Seats"
                  name="numberOfSeats"
                  type="number"
                  value={advanceBooking.bookingDetails.numberOfSeats ?? ''}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      bookingDetails: {
                        ...advanceBooking.bookingDetails,
                        numberOfSeats: value.numberOfSeats ? Number(value.numberOfSeats) : null,
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
                <RadioGroup
                  question="Air Conditioning"
                  name="airConditioning"
                  options={['Yes', 'No']}
                  value={advanceBooking.bookingDetails.airConditioning ? 'Yes' : 'No'}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      bookingDetails: {
                        ...advanceBooking.bookingDetails,
                        airConditioning: value.airConditioning === 'Yes',
                      },
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
            </Row>
          </Panel>
          <Panel
            title="Customer Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            {advanceBooking.bookingDetails.customerSelection === 'Existing' ? (
              <>
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
                      value={advanceBooking.customerDetails.customerCategory}
                      changeHandler={value => {
                        setAdvanceBooking({
                          ...advanceBooking,
                          customerDetails: {
                            customerId: advanceBooking.customerDetails.customerId ?? '',
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
                      value={advanceBooking.customerDetails.customerId}
                      changeHandler={value => {
                        setAdvanceBooking({
                          ...advanceBooking,
                          customerDetails: {
                            customerId: value.customerId.toString(),
                            customerCategory: advanceBooking.customerDetails.customerCategory ?? '',
                          },
                        })
                      }}
                    />
                  </Column>
                </Row>
              </>
            ) : (
              <>
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Customer Name"
                      name="customerName"
                      value={advanceBooking.customerDetails.customerName ?? ''}
                      changeHandler={value => {
                        setAdvanceBooking({
                          ...advanceBooking,
                          customerDetails: {
                            customerName: value.customerName?.toString() || '',
                            customerEmail: advanceBooking.customerDetails.customerEmail?.toString() || '',
                            customerContact: advanceBooking.customerDetails.customerContact?.toString() || '',
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
                      label="Customer Contact"
                      name="customerContact"
                      value={advanceBooking.customerDetails.customerContact ?? ''}
                      changeHandler={value => {
                        setAdvanceBooking({
                          ...advanceBooking,
                          customerDetails: {
                            customerName: advanceBooking.customerDetails.customerName || '',
                            customerEmail: advanceBooking.customerDetails.customerEmail || '',
                            customerContact: value.customerContact?.toString() || '',
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
                      label="Customer Email"
                      name="customerEmail"
                      value={advanceBooking.customerDetails.customerEmail ?? ''}
                      changeHandler={value => {
                        setAdvanceBooking({
                          ...advanceBooking,
                          customerDetails: {
                            customerName: advanceBooking.customerDetails.customerName || '',
                            customerEmail: value.customerEmail?.toString() || '',
                            customerContact: advanceBooking.customerDetails.customerContact || '',
                          },
                        })
                      }}
                    />
                  </Column>
                </Row>
              </>
            )}
          </Panel>
          <Panel
            title="Comments"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <TextArea
              name="comments"
              value={advanceBooking.comments}
              changeHandler={value => {
                setAdvanceBooking({
                  ...advanceBooking,
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

export default CreateAdvanceBooking
