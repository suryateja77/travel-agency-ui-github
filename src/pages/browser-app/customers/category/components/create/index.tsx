import React, { FunctionComponent, useEffect, useMemo, useCallback, useReducer } from 'react'
import { Panel, Row, Column, TextInput, Button, TextArea, Alert, Toggle } from '@base'
import { PageHeader, PermissionGuard } from '@components'
import { CustomerModel } from '@types'
import { bemClass, pathToName, nameToPath, validatePayload } from '@utils'
import { useToast } from '@contexts/ToastContext'

import './style.scss'
import { useNavigate, useParams } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateCustomerMutation, useUpdateCustomerMutation, useCustomerByIdQuery } from '@api/queries/customer'
import Loader from '@components/loader'

const blk = 'create-customer'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

interface CreateCustomerProps {
  category?: string
}

interface CustomerResponseModel extends CustomerModel {
  _id: string
}

interface ValidationErrors {
  [key: string]: string
}

// State interface for useReducer
interface FormState {
  customer: CustomerModel
  isEditing: boolean
  customerId: string
  validationErrors: ValidationErrors
  isValidationError: boolean
}

// Action types for useReducer
type FormAction =
  | { type: 'SET_CUSTOMER'; payload: CustomerModel }
  | { type: 'UPDATE_CUSTOMER_FIELD'; payload: { field: keyof CustomerModel; value: any } }
  | { type: 'UPDATE_ADDRESS_FIELD'; payload: { field: keyof CustomerModel['address']; value: any } }
  | { type: 'SET_EDITING_MODE'; payload: { isEditing: boolean; customerId: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_CUSTOMER: CustomerModel = {
  name: '',
  contact: '',
  whatsAppNumber: '',
  email: '',
  isActive: true,
  comment: '',
  address: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
  },
  category: '',
} as const

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================

const initialState: FormState = {
  customer: INITIAL_CUSTOMER,
  isEditing: false,
  customerId: '',
  validationErrors: {},
  isValidationError: false,
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload }

    case 'UPDATE_CUSTOMER_FIELD':
      return {
        ...state,
        customer: { ...state.customer, [action.payload.field]: action.payload.value },
      }

    case 'UPDATE_ADDRESS_FIELD':
      return {
        ...state,
        customer: {
          ...state.customer,
          address: {
            ...state.customer.address,
            [action.payload.field]: action.payload.value,
          },
        },
      }

    case 'SET_EDITING_MODE':
      return {
        ...state,
        isEditing: action.payload.isEditing,
        customerId: action.payload.customerId,
      }

    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload.errors,
        isValidationError: action.payload.hasError,
      }

    default:
      return state
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const transformCustomerResponse = (response: CustomerResponseModel): CustomerModel => ({
  name: response.name || '',
  contact: response.contact || '',
  whatsAppNumber: response.whatsAppNumber || '',
  email: response.email || '',
  isActive: response.isActive !== undefined ? response.isActive : true,
  comment: response.comment || '',
  address: {
    addressLine1: response.address?.addressLine1 || '',
    addressLine2: response.address?.addressLine2 || '',
    city: response.address?.city || '',
    state: response.address?.state || '',
    pinCode: response.address?.pinCode || '',
  },
  category: response.category || '',
})

const CreateCustomer: FunctionComponent<CreateCustomerProps> = ({ category = '' }) => {
  const navigate = useNavigate()
  const params = useParams()
  const { showToast } = useToast()

  const [state, dispatch] = useReducer(formReducer, initialState)
  const { customer, isEditing, customerId, validationErrors, isValidationError } = state

  // API Hooks
  const createCustomer = useCreateCustomerMutation()
  const updateCustomer = useUpdateCustomerMutation()
  const { data: customerDataResponse, isLoading, error: getCustomerDataError } = useCustomerByIdQuery(params.id || '')

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCustomerFieldChange = useCallback(
    <K extends keyof CustomerModel>(field: K, value: CustomerModel[K]) => {
      dispatch({ type: 'UPDATE_CUSTOMER_FIELD', payload: { field, value } })
    },
    []
  )

  const handleAddressFieldChange = useCallback(
    <K extends keyof CustomerModel['address']>(field: K, value: CustomerModel['address'][K]) => {
      dispatch({ type: 'UPDATE_ADDRESS_FIELD', payload: { field, value } })
    },
    []
  )

  const navigateBack = useCallback(() => {
    navigate(`/customers/${category}`)
  }, [navigate, category])

  const handleSubmit = useCallback(async () => {
    // Validate form
    const validationSchema = createValidationSchema(customer)
    const { isValid, errorMap } = validatePayload(validationSchema, customer)

    dispatch({
      type: 'SET_VALIDATION_ERRORS',
      payload: { errors: errorMap, hasError: !isValid },
    })

    if (!isValid) {
      console.error('Validation Error', errorMap)
      return
    }

    // Prepare data for submission
    const dataToSave: CustomerModel = {
      ...customer,
      category: nameToPath(category),
    }

    try {
      if (isEditing) {
        await updateCustomer.mutateAsync({ _id: customerId, ...dataToSave })
        showToast('Customer updated successfully!', 'success')
      } else {
        await createCustomer.mutateAsync(dataToSave)
        showToast('New customer created successfully!', 'success')
      }
      navigateBack()
    } catch (error) {
      console.error('Unable to create/update customer', error)
      showToast(`Unable to ${isEditing ? 'update' : 'create'} customer. Please try again.`, 'error')
    }
  }, [customer, isEditing, customerId, updateCustomer, createCustomer, category, showToast, navigateBack])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load customer data when editing
  useEffect(() => {
    if (customerDataResponse) {
      const transformedCustomer = transformCustomerResponse(customerDataResponse)
      dispatch({ type: 'SET_CUSTOMER', payload: transformedCustomer })
      dispatch({
        type: 'SET_EDITING_MODE',
        payload: { isEditing: true, customerId: params.id || '' },
      })
    }
  }, [customerDataResponse, params.id])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const categoryDisplayName = useMemo(() => pathToName(category), [category])

  const breadcrumbData = useMemo(
    () => [
      { label: 'Home', route: '/dashboard' },
      { label: `${categoryDisplayName} list`, route: `/customers/${category}` },
      { label: isEditing ? 'Update' : 'Create' },
    ],
    [categoryDisplayName, category, isEditing]
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={isEditing ? `Update ${categoryDisplayName}` : `Add ${categoryDisplayName}`}
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
            {getCustomerDataError ? (
              <>
                <Alert
                  type="error"
                  message="Unable to load customer data. Please try again."
                  className={bemClass([blk, 'margin-bottom'])}
                />
                <Button size="medium" clickHandler={navigateBack}>
                  Go Back
                </Button>
              </>
            ) : (
              <>
                <Panel
                  title="Customer details"
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <Row>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <TextInput
                        label="Customer Name"
                        name="name"
                        value={customer.name}
                        changeHandler={value => {
                          handleCustomerFieldChange('name', value.name?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors.name}
                        invalid={!!validationErrors.name}
                      />
                    </Column>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <TextInput
                        label="Contact"
                        name="contact"
                        value={customer.contact}
                        changeHandler={value => {
                          handleCustomerFieldChange('contact', value.contact?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors.contact}
                        invalid={!!validationErrors.contact}
                      />
                    </Column>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <TextInput
                        label="WhatsApp Number"
                        name="whatsAppNumber"
                        value={customer.whatsAppNumber}
                        changeHandler={value => {
                          handleCustomerFieldChange('whatsAppNumber', value.whatsAppNumber?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors.whatsAppNumber}
                        invalid={!!validationErrors.whatsAppNumber}
                      />
                    </Column>
                  </Row>
                  <Row>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <TextInput
                        label="Email"
                        name="email"
                        value={customer.email || ''}
                        changeHandler={value => {
                          handleCustomerFieldChange('email', value.email?.toString() ?? '')
                        }}
                        errorMessage={validationErrors.email}
                        invalid={!!validationErrors.email}
                      />
                    </Column>
                  </Row>
                </Panel>

                <Panel
                  title="Address Details"
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <Row>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <TextInput
                        label="Address Line 1"
                        name="addressLine1"
                        value={customer.address.addressLine1}
                        changeHandler={value => {
                          handleAddressFieldChange('addressLine1', value.addressLine1?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['address.addressLine1']}
                        invalid={!!validationErrors['address.addressLine1']}
                      />
                    </Column>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <TextInput
                        label="Address Line 2"
                        name="addressLine2"
                        value={customer.address.addressLine2}
                        changeHandler={value => {
                          handleAddressFieldChange('addressLine2', value.addressLine2?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['address.addressLine2']}
                        invalid={!!validationErrors['address.addressLine2']}
                      />
                    </Column>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <TextInput
                        label="City"
                        name="city"
                        value={customer.address.city}
                        changeHandler={value => {
                          handleAddressFieldChange('city', value.city?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['address.city']}
                        invalid={!!validationErrors['address.city']}
                      />
                    </Column>
                  </Row>
                  <Row>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <TextInput
                        label="State"
                        name="state"
                        value={customer.address.state}
                        changeHandler={value => {
                          handleAddressFieldChange('state', value.state?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['address.state']}
                        invalid={!!validationErrors['address.state']}
                      />
                    </Column>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <TextInput
                        label="Pin Code"
                        name="pinCode"
                        value={customer.address.pinCode}
                        changeHandler={value => {
                          handleAddressFieldChange('pinCode', value.pinCode?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['address.pinCode']}
                        invalid={!!validationErrors['address.pinCode']}
                      />
                    </Column>
                  </Row>
                </Panel>

                <Panel
                  title="Comments"
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextArea
                    className={bemClass([blk, 'margin-bottom'])}
                    name="comment"
                    value={customer.comment || ''}
                    changeHandler={value => {
                      handleCustomerFieldChange('comment', value.comment?.toString() ?? '')
                    }}
                    placeholder="Enter any additional comments or notes here..."
                  />
                </Panel>

                <Panel
                  title="Is active"
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <Row>
                    <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                      <Toggle
                        name="isActive"
                        checked={customer.isActive}
                        changeHandler={obj => {
                          handleCustomerFieldChange('isActive', !!obj.isActive)
                        }}
                      />
                    </Column>
                  </Row>
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
                    clickHandler={handleSubmit}
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

export default CreateCustomer