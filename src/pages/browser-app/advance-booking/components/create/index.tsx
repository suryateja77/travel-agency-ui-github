import React, { FunctionComponent, useState } from 'react'
import { bemClass, validatePayload } from '@utils'

import './style.scss'
import { AdvanceBookingModel } from '@types'
import { Button, Column, Panel, RadioGroup, Row, SelectInput, TextArea, TextInput, Alert, ConfirmationPopup, Modal } from '@base'
import { PageHeader } from '@components'
import { useNavigate } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateAdvanceBookingMutation } from '@api/queries/advance-booking'
import { useCustomerByCategory } from '@api/queries/customer'

const blk = 'create-advance-booking'

interface Props {}

const CreateAdvanceBooking: FunctionComponent<Props> = () => {
  const sampleAdvanceBookingModel: AdvanceBookingModel = {
    customerType: 'existing',
    pickUpLocation: '',
    dropOffLocation: '',
    pickUpDateTime: null,
    noOfSeats: null,
    hasAc: false,
    vehicleType: '',
    customerCategory: null,
    customer: null,
    customerDetails: null,
    comment: '',
  }

  const navigate = useNavigate()
  const createAdvanceBooking = useCreateAdvanceBookingMutation()

  const [advanceBooking, setAdvanceBooking] = useState<AdvanceBookingModel>(sampleAdvanceBookingModel)
  const [isEditing, setIsEditing] = useState(false)
  const [advanceBookingId, setAdvanceBookingId] = useState('')

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New advance booking created successfully!')

  const [errorMap, setErrorMap] = useState<Record<string, any>>(sampleAdvanceBookingModel)
  const [isValidationError, setIsValidationError] = useState(false)

  // Fetch customers when customerCategory is selected for existing customer type
  const shouldFetchCustomers = advanceBooking.customerType === 'existing' && !!advanceBooking.customerCategory
  const { data: customersResponse } = useCustomerByCategory(
    shouldFetchCustomers ? advanceBooking.customerCategory || '' : ''
  )
  const customersData = customersResponse?.data || []

  const navigateBack = () => {
    navigate('/advance-booking')
  }

  const closeConfirmationPopUp = () => {
    if (showConfirmationModal) {
      setShowConfirmationModal(false)
    }
  }

  const submitHandler = async () => {
    const validationSchema = createValidationSchema(advanceBooking)
    const { isValid, errorMap } = validatePayload(validationSchema, advanceBooking)

    setIsValidationError(!isValid)
    setErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        if (isEditing) {
          // await updateAdvanceBooking.mutateAsync({ _id: advanceBookingId, ...advanceBooking })
          setConfirmationPopUpType('update')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('Advance booking updated successfully!')
        } else {
          await createAdvanceBooking.mutateAsync(advanceBooking)
          setConfirmationPopUpType('create')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('New advance booking created successfully!')
        }

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to create/Update advance booking', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Failed')
        setConfirmationPopUpSubtitle(`Unable to ${isEditing ? 'update' : 'create'} advance booking, please try again.`)
      }
    } else {
      console.log('Create Advance Booking: Validation Error', errorMap)
    }
  }
  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={isEditing ? 'Update Advance Booking' : 'New Advance Booking'}
        withBreadCrumb
        breadCrumbData={[
          {
            label: 'Home',
            route: '/dashboard',
          },
          {
            label: 'Advance Bookings',
            route: '/advance-booking',
          },
          {
            label: isEditing ? 'Update' : 'Create',
          },
        ]}
      />
      {isValidationError && (
        <Alert
          type="error"
          message="There is an error with submission, please correct errors indicated below."
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      <div className={bemClass([blk, 'content'])}>
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
                question="Customer Type"
                name="customerType"
                options={['Existing', 'New']}
                value={advanceBooking.customerType.charAt(0).toUpperCase() + advanceBooking.customerType.slice(1)}
                changeHandler={value => {
                  setAdvanceBooking({
                    ...advanceBooking,
                    customerType: value.customerType.toLowerCase(),
                    customerCategory: null,
                    customer: null,
                    customerDetails: null,
                  })
                }}
                direction="horizontal"
                required
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Pickup Location"
                name="pickUpLocation"
                value={advanceBooking.pickUpLocation}
                changeHandler={value => {
                  setAdvanceBooking({
                    ...advanceBooking,
                    pickUpLocation: value.pickUpLocation?.toString() ?? '',
                  })
                }}
                required
                errorMessage={errorMap['pickUpLocation']}
                invalid={errorMap['pickUpLocation']}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Drop Off Location"
                name="dropOffLocation"
                value={advanceBooking.dropOffLocation}
                changeHandler={value => {
                  setAdvanceBooking({
                    ...advanceBooking,
                    dropOffLocation: value.dropOffLocation?.toString() ?? '',
                  })
                }}
                required
                errorMessage={errorMap['dropOffLocation']}
                invalid={errorMap['dropOffLocation']}
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
                name="pickUpDateTime"
                type="datetime-local"
                value={advanceBooking.pickUpDateTime ? new Date(advanceBooking.pickUpDateTime).toISOString().slice(0, 16) : ''}
                changeHandler={value => {
                  setAdvanceBooking({
                    ...advanceBooking,
                    pickUpDateTime: value.pickUpDateTime ? new Date(value.pickUpDateTime) : null,
                  })
                }}
                required
                errorMessage={errorMap['pickUpDateTime']}
                invalid={errorMap['pickUpDateTime']}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Number of Seats"
                name="noOfSeats"
                type="number"
                value={advanceBooking.noOfSeats ?? ''}
                changeHandler={value => {
                  setAdvanceBooking({
                    ...advanceBooking,
                    noOfSeats: value.noOfSeats ? Number(value.noOfSeats) : null,
                  })
                }}
                required
                errorMessage={errorMap['noOfSeats']}
                invalid={errorMap['noOfSeats']}
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
                  { key: 'SUV', value: 'SUV' },
                ]}
                value={advanceBooking.vehicleType}
                changeHandler={value => {
                  setAdvanceBooking({
                    ...advanceBooking,
                    vehicleType: value.vehicleType?.toString() ?? '',
                  })
                }}
                required
                errorMessage={errorMap['vehicleType']}
                invalid={errorMap['vehicleType']}
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
                name="hasAc"
                options={['Yes', 'No']}
                value={advanceBooking.hasAc ? 'Yes' : 'No'}
                changeHandler={value => {
                  setAdvanceBooking({
                    ...advanceBooking,
                    hasAc: value.hasAc === 'Yes',
                  })
                }}
                direction="horizontal"
                required
              />
            </Column>
          </Row>
        </Panel>

        <Panel
          title="Customer Details"
          className={bemClass([blk, 'margin-bottom'])}
        >
          {advanceBooking.customerType === 'existing' ? (
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Customer Category"
                  name="customerCategory"
                  options={[
                    { key: 'regular', value: 'Regular' },
                    { key: 'operator', value: 'Operator' },
                  ]}
                  value={advanceBooking.customerCategory || ''}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      customerCategory: value.customerCategory?.toString() || null,
                      customer: null, // Reset customer when category changes
                    })
                  }}
                  required
                  errorMessage={errorMap['customerCategory']}
                  invalid={errorMap['customerCategory']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Customer"
                  name="customer"
                  options={customersData.map((customer: any) => ({
                    key: customer._id,
                    value: customer.name,
                  }))}
                  value={
                    advanceBooking.customer && customersData.length > 0
                      ? (customersData.find((customer: any) => customer._id === advanceBooking.customer) as any)?.name ?? ''
                      : ''
                  }
                  changeHandler={value => {
                    const selectedCustomer = customersData.find((customer: any) => customer.name === value.customer)
                    setAdvanceBooking({
                      ...advanceBooking,
                      customer: selectedCustomer?._id || null,
                    })
                  }}
                  required
                  errorMessage={errorMap['customer']}
                  invalid={errorMap['customer']}
                  disabled={!advanceBooking.customerCategory}
                />
              </Column>
            </Row>
          ) : (
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Customer Name"
                  name="customerName"
                  value={advanceBooking.customerDetails?.name ?? ''}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      customerDetails: {
                        name: value.customerName?.toString() || '',
                        contact: advanceBooking.customerDetails?.contact || '',
                        email: advanceBooking.customerDetails?.email || '',
                      },
                    })
                  }}
                  required
                  errorMessage={errorMap['customerDetails.name']}
                  invalid={errorMap['customerDetails.name']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Customer Contact"
                  name="customerContact"
                  value={advanceBooking.customerDetails?.contact ?? ''}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      customerDetails: {
                        name: advanceBooking.customerDetails?.name || '',
                        contact: value.customerContact?.toString() || '',
                        email: advanceBooking.customerDetails?.email || '',
                      },
                    })
                  }}
                  required
                  errorMessage={errorMap['customerDetails.contact']}
                  invalid={errorMap['customerDetails.contact']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Customer Email"
                  name="customerEmail"
                  type="email"
                  value={advanceBooking.customerDetails?.email ?? ''}
                  changeHandler={value => {
                    setAdvanceBooking({
                      ...advanceBooking,
                      customerDetails: {
                        name: advanceBooking.customerDetails?.name || '',
                        contact: advanceBooking.customerDetails?.contact || '',
                        email: value.customerEmail?.toString() || '',
                      },
                    })
                  }}
                  errorMessage={errorMap['customerDetails.email']}
                  invalid={errorMap['customerDetails.email']}
                />
              </Column>
            </Row>
          )}
        </Panel>

        <Panel
          title="Comment"
          className={bemClass([blk, 'margin-bottom'])}
        >
          <TextArea
            name="comment"
            className={bemClass([blk, 'margin-bottom'])}
            value={advanceBooking.comment}
            changeHandler={value => {
              setAdvanceBooking({
                ...advanceBooking,
                comment: value.comment?.toString() ?? '',
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
          <Button
            size="medium"
            category="primary"
            clickHandler={submitHandler}
          >
            Submit
          </Button>
        </div>
      </div>
      <Modal
        show={showConfirmationModal}
        closeHandler={() => {
          if (showConfirmationModal) {
            setShowConfirmationModal(false)
          }
        }}
      >
        <ConfirmationPopup
          type={confirmationPopUpType}
          title={confirmationPopUpTitle}
          subTitle={confirmationPopUpSubtitle}
          confirmButtonText="Okay"
          confirmHandler={['create', 'update'].includes(confirmationPopUpType) ? navigateBack : closeConfirmationPopUp}
        />
      </Modal>
    </div>
  )
}

export default CreateAdvanceBooking
