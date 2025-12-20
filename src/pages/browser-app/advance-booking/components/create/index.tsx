import React, { FunctionComponent, useEffect, useMemo, useCallback, useReducer } from 'react'
import { Button, Column, Panel, RadioGroup, Row, SelectInput, TextArea, TextInput, NumberInput, Alert } from '@base'
import { AdvanceBookingModel, CustomerModel, INITIAL_ADVANCE_BOOKING } from '@types'
import { bemClass, validatePayload } from '@utils'
import { useToast } from '@contexts/ToastContext'

import './style.scss'
import { useNavigate, useParams } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateAdvanceBookingMutation, useUpdateAdvanceBookingMutation, useAdvanceBookingByIdQuery } from '@api/queries/advance-booking'
import { useCustomerByCategory } from '@api/queries/customer'
import { PageHeader } from '@components'
import Loader from '@components/loader'

const blk = 'create-advance-booking'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

interface CreateAdvanceBookingProps {}

interface SelectOption {
  key: string
  value: string
}

interface ValidationErrors {
  [key: string]: string
}

// State interface for useReducer
interface FormState {
  advanceBooking: AdvanceBookingModel
  isEditing: boolean
  advanceBookingId: string
  validationErrors: ValidationErrors
  isValidationError: boolean
  customerSelectOptions: SelectOption[]
  submitButtonLoading: boolean
}

// Action types for useReducer
type FormAction =
  | { type: 'SET_ADVANCE_BOOKING'; payload: AdvanceBookingModel }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof AdvanceBookingModel; value: any } }
  | { type: 'UPDATE_CUSTOMER_DETAILS'; payload: Partial<{ name: string; contact: string; email: string }> }
  | { type: 'SET_EDITING_MODE'; payload: { isEditing: boolean; advanceBookingId: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }
  | { type: 'SET_CUSTOMER_OPTIONS'; payload: SelectOption[] }
  | { type: 'SET_SUBMIT_LOADING'; payload: boolean }

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_CUSTOMER_DETAILS = {
  name: '',
  contact: '',
  email: '',
} as const

const VEHICLE_TYPE_OPTIONS: SelectOption[] = [
  { key: 'Sedan', value: 'Sedan' },
  { key: 'Hatchback', value: 'Hatchback' },
  { key: 'SUV', value: 'SUV' },
] as const

const CUSTOMER_CATEGORY_OPTIONS: SelectOption[] = [
  { key: 'regular', value: 'Regular' },
  { key: 'operator', value: 'Operator' },
] as const

const CUSTOMER_TYPE_OPTIONS: Array<{ key: string; value: string }> = [
  { key: 'customer-type-existing', value: 'Existing' },
  { key: 'customer-type-new', value: 'New' }
]
const AC_OPTIONS: Array<{ key: string; value: string }> = [
  { key: 'ac-yes', value: 'Yes' },
  { key: 'ac-no', value: 'No' }
]

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================

const initialState: FormState = {
  advanceBooking: INITIAL_ADVANCE_BOOKING,
  isEditing: false,
  advanceBookingId: '',
  validationErrors: {},
  isValidationError: false,
  customerSelectOptions: [],
  submitButtonLoading: false,
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_ADVANCE_BOOKING':
      return { ...state, advanceBooking: action.payload }

    case 'UPDATE_FIELD':
      return {
        ...state,
        advanceBooking: { ...state.advanceBooking, [action.payload.field]: action.payload.value },
      }

    case 'UPDATE_CUSTOMER_DETAILS':
      return {
        ...state,
        advanceBooking: {
          ...state.advanceBooking,
          customerDetails: {
            ...INITIAL_CUSTOMER_DETAILS,
            ...state.advanceBooking.customerDetails,
            ...action.payload,
          },
        },
      }

    case 'SET_EDITING_MODE':
      return {
        ...state,
        isEditing: action.payload.isEditing,
        advanceBookingId: action.payload.advanceBookingId,
      }

    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload.errors,
        isValidationError: action.payload.hasError,
      }

    case 'SET_CUSTOMER_OPTIONS':
      return {
        ...state,
        customerSelectOptions: action.payload,
      }

    case 'SET_SUBMIT_LOADING':
      return {
        ...state,
        submitButtonLoading: action.payload,
      }

    default:
      return state
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDateTimeForInput = (date: Date | null): string => {
  if (!date) return ''
  return new Date(date).toISOString().slice(0, 16)
}

const extractIdFromResponse = (field: any): string => {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object' && field._id) return field._id
  return ''
}

const transformAdvanceBookingResponse = (response: AdvanceBookingModel & { _id: string }): AdvanceBookingModel => ({
  customerType: response.customerType || 'existing',
  pickUpLocation: response.pickUpLocation || '',
  dropOffLocation: response.dropOffLocation || '',
  pickUpDateTime: response.pickUpDateTime ? new Date(response.pickUpDateTime) : null,
  noOfSeats: response.noOfSeats || null,
  hasAc: response.hasAc || false,
  vehicleType: response.vehicleType || '',
  customerCategory: response.customerCategory || null,
  customer: extractIdFromResponse(response.customer),
  customerDetails: response.customerDetails || null,
  comment: response.comment || '',
})

const CreateAdvanceBooking: FunctionComponent<CreateAdvanceBookingProps> = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { showToast } = useToast()

  const [state, dispatch] = useReducer(formReducer, initialState)
  const { advanceBooking, isEditing, advanceBookingId, validationErrors, isValidationError, customerSelectOptions, submitButtonLoading } = state

  // API Hooks
  const createAdvanceBooking = useCreateAdvanceBookingMutation()
  const updateAdvanceBooking = useUpdateAdvanceBookingMutation()
  const { data: advanceBookingDataResponse, isLoading, error: getAdvanceBookingDataError } = useAdvanceBookingByIdQuery(params.id || '')

  // Conditional API query for customers
  const shouldFetchCustomers = advanceBooking.customerType === 'existing' && !!advanceBooking.customerCategory
  const customersQuery = useCustomerByCategory(shouldFetchCustomers ? advanceBooking.customerCategory || '' : '')

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFieldChange = useCallback(<K extends keyof AdvanceBookingModel>(field: K, value: AdvanceBookingModel[K]) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } })
  }, [])

  const handleCustomerDetailsChange = useCallback((updates: Partial<{ name: string; contact: string; email: string }>) => {
    dispatch({ type: 'UPDATE_CUSTOMER_DETAILS', payload: updates })
  }, [])

  const navigateBack = useCallback(() => {
    navigate('/advance-booking')
  }, [navigate])

  const handleCustomerTypeChange = useCallback(
    (customerType: string) => {
      const lowerCaseType = customerType.toLowerCase() as 'existing' | 'new'
      dispatch({
        type: 'SET_ADVANCE_BOOKING',
        payload: {
          ...advanceBooking,
          customerType: lowerCaseType,
          customerCategory: null,
          customer: null,
          customerDetails: null,
        },
      })
    },
    [advanceBooking],
  )

  const handleCustomerCategoryChange = useCallback(
    (customerCategory: string | null) => {
      handleFieldChange('customerCategory', customerCategory)
      handleFieldChange('customer', null) // Reset customer when category changes
    },
    [handleFieldChange],
  )

  const handleCustomerChange = useCallback(
    (customerValue: string) => {
      const selectedCustomer = customerSelectOptions.find(c => c.value === customerValue)
      handleFieldChange('customer', selectedCustomer?.key || null)
    },
    [customerSelectOptions, handleFieldChange],
  )

  const handleSubmit = useCallback(async () => {
    try {
      // Set loading state
      dispatch({ type: 'SET_SUBMIT_LOADING', payload: true })

      // Validate form
      const validationSchema = createValidationSchema(advanceBooking)
      const { isValid, errorMap } = validatePayload(validationSchema, advanceBooking)

      dispatch({
        type: 'SET_VALIDATION_ERRORS',
        payload: { errors: errorMap, hasError: !isValid },
      })

      if (!isValid) {
        console.error('Validation Error', errorMap)
        dispatch({ type: 'SET_SUBMIT_LOADING', payload: false })
        return
      }

      // Submit form
      if (isEditing) {
        await updateAdvanceBooking.mutateAsync({ _id: advanceBookingId, ...advanceBooking })
        showToast('Advance booking updated successfully!', 'success')
      } else {
        await createAdvanceBooking.mutateAsync(advanceBooking)
        showToast('New advance booking created successfully!', 'success')
      }

      // Clear loading state before navigation
      dispatch({ type: 'SET_SUBMIT_LOADING', payload: false })
      navigateBack()
    } catch (error) {
      console.error('Unable to create/update advance booking', error)
      showToast(`Unable to ${isEditing ? 'update' : 'create'} advance booking. Please try again.`, 'error')
      dispatch({ type: 'SET_SUBMIT_LOADING', payload: false })
    }
  }, [advanceBooking, isEditing, advanceBookingId, createAdvanceBooking, updateAdvanceBooking, showToast, navigateBack])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load advance booking data when editing
  useEffect(() => {
    if (advanceBookingDataResponse) {
      const transformedAdvanceBooking = transformAdvanceBookingResponse(advanceBookingDataResponse)
      dispatch({ type: 'SET_ADVANCE_BOOKING', payload: transformedAdvanceBooking })
      dispatch({
        type: 'SET_EDITING_MODE',
        payload: { isEditing: true, advanceBookingId: params.id || '' },
      })
    }
  }, [advanceBookingDataResponse, params.id])

  // Handle customers data
  useEffect(() => {
    if (customersQuery.data?.data) {
      const options = customersQuery.data.data.map((customer: CustomerModel & { _id: string }) => ({
        key: customer._id,
        value: customer.name,
      }))
      dispatch({ type: 'SET_CUSTOMER_OPTIONS', payload: options })
    } else {
      dispatch({ type: 'SET_CUSTOMER_OPTIONS', payload: [] })
    }
  }, [customersQuery.data])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const breadcrumbData = useMemo(
    () => [{ label: 'Home', route: '/dashboard' }, { label: 'Advance Bookings', route: '/advance-booking' }, { label: isEditing ? 'Update' : 'Create' }],
    [isEditing],
  )

  const selectedCustomerValue = useMemo(() => {
    const customerId = advanceBooking.customer
    if (!customerId || !customerSelectOptions.length) return ''
    const option = customerSelectOptions.find(opt => opt.key === customerId)
    return option?.value || ''
  }, [advanceBooking.customer, customerSelectOptions])

  const customerTypeDisplayValue = useMemo(() => advanceBooking.customerType.charAt(0).toUpperCase() + advanceBooking.customerType.slice(1), [advanceBooking.customerType])
  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={isEditing ? 'Update Advance Booking' : 'New Advance Booking'}
        withBreadCrumb
        breadCrumbData={breadcrumbData}
      />

      {isValidationError && (
        <Alert
          type="error"
          message="There is an error with submission, please correct errors indicated below."
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}

      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : (
          <>
            {getAdvanceBookingDataError ? (
              <>
                <Alert
                  type="error"
                  message="Unable to load advance booking data. Please try again."
                  className={bemClass([blk, 'margin-bottom'])}
                />
                <Button
                  size="medium"
                  clickHandler={navigateBack}
                >
                  Go Back
                </Button>
              </>
            ) : (
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
                        question="Customer Type"
                        name="customerType"
                        options={CUSTOMER_TYPE_OPTIONS}
                        value={customerTypeDisplayValue}
                        changeHandler={value => {
                          handleCustomerTypeChange(value.customerType)
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
                          handleFieldChange('pickUpLocation', value.pickUpLocation?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors.pickUpLocation}
                        invalid={!!validationErrors.pickUpLocation}
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
                          handleFieldChange('dropOffLocation', value.dropOffLocation?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors.dropOffLocation}
                        invalid={!!validationErrors.dropOffLocation}
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
                        value={formatDateTimeForInput(advanceBooking.pickUpDateTime)}
                        changeHandler={value => {
                          handleFieldChange('pickUpDateTime', value.pickUpDateTime ? new Date(value.pickUpDateTime) : null)
                        }}
                        required
                        errorMessage={validationErrors.pickUpDateTime}
                        invalid={!!validationErrors.pickUpDateTime}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <NumberInput
                        label="Number of Seats"
                        name="noOfSeats"
                        value={advanceBooking.noOfSeats ?? ''}
                        changeHandler={value => {
                          handleFieldChange('noOfSeats', value.noOfSeats ?? null)
                        }}
                        min={1}
                        required
                        errorMessage={validationErrors.noOfSeats}
                        invalid={!!validationErrors.noOfSeats}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <SelectInput
                        label="Vehicle Type"
                        name="vehicleType"
                        options={VEHICLE_TYPE_OPTIONS}
                        value={advanceBooking.vehicleType}
                        changeHandler={value => {
                          handleFieldChange('vehicleType', value.vehicleType?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors.vehicleType}
                        invalid={!!validationErrors.vehicleType}
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
                        options={AC_OPTIONS}
                        value={advanceBooking.hasAc ? 'Yes' : 'No'}
                        changeHandler={value => {
                          handleFieldChange('hasAc', value.hasAc === 'Yes')
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
                          options={CUSTOMER_CATEGORY_OPTIONS}
                          value={advanceBooking.customerCategory || ''}
                          changeHandler={value => {
                            handleCustomerCategoryChange(value.customerCategory?.toString() || null)
                          }}
                          required
                          errorMessage={validationErrors.customerCategory}
                          invalid={!!validationErrors.customerCategory}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <SelectInput
                          label="Customer"
                          name="customer"
                          options={customerSelectOptions}
                          value={selectedCustomerValue}
                          changeHandler={value => {
                            handleCustomerChange(value.customer?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors.customer}
                          invalid={!!validationErrors.customer}
                          disabled={!advanceBooking.customerCategory || customersQuery.isLoading || customersQuery.isError}
                          isLoading={customersQuery.isLoading && !!advanceBooking.customerCategory}
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
                            handleCustomerDetailsChange({ name: value.customerName?.toString() || '' })
                          }}
                          required
                          errorMessage={validationErrors['customerDetails.name']}
                          invalid={!!validationErrors['customerDetails.name']}
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
                            handleCustomerDetailsChange({ contact: value.customerContact?.toString() || '' })
                          }}
                          required
                          errorMessage={validationErrors['customerDetails.contact']}
                          invalid={!!validationErrors['customerDetails.contact']}
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
                            handleCustomerDetailsChange({ email: value.customerEmail?.toString() || '' })
                          }}
                          errorMessage={validationErrors['customerDetails.email']}
                          invalid={!!validationErrors['customerDetails.email']}
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
                      handleFieldChange('comment', value.comment?.toString() ?? '')
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
                    disabled={submitButtonLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="medium"
                    category="primary"
                    clickHandler={handleSubmit}
                    loading={submitButtonLoading}
                  >
                    {isEditing ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CreateAdvanceBooking
