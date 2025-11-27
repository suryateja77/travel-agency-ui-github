import { Panel, Row, Column, TextInput, Button, Alert, Toggle, TextArea } from '@base'
import { SupplierModel, INITIAL_SUPPLIER } from '@types'
import { bemClass, validatePayload } from '@utils'
import { useToast } from '@contexts/ToastContext'
import React, { FunctionComponent, useState, useMemo, useCallback, useReducer, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateSupplierMutation, useUpdateSupplierMutation, useSupplierByIdQuery } from '@api/queries/supplier'
import PageHeader from '@components/page-header'
import Loader from '@components/loader'

import './style.scss'

const blk = 'create-supplier'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

interface CreateSupplierProps {}

interface ValidationErrors {
  [key: string]: string
}

// State interface for useReducer
interface FormState {
  supplier: SupplierModel
  isEditing: boolean
  supplierId: string
  validationErrors: ValidationErrors
  isValidationError: boolean
}

// Action types for useReducer
type FormAction =
  | { type: 'SET_SUPPLIER'; payload: SupplierModel }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof SupplierModel; value: any } }
  | { type: 'UPDATE_ADDRESS_FIELD'; payload: { field: keyof SupplierModel['address']; value: any } }
  | { type: 'UPDATE_POINT_OF_CONTACT_FIELD'; payload: { field: keyof SupplierModel['pointOfContact']; value: any } }
  | { type: 'SET_EDITING_MODE'; payload: { isEditing: boolean; supplierId: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }

// ============================================================================
// CONSTANTS
// ============================================================================

const API_ERROR_MESSAGES = {
  general: 'Unable to load data. Please check your connection and try again.',
} as const

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================

const initialState: FormState = {
  supplier: INITIAL_SUPPLIER,
  isEditing: false,
  supplierId: '',
  validationErrors: {},
  isValidationError: false,
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_SUPPLIER':
      return { ...state, supplier: action.payload }

    case 'UPDATE_FIELD':
      return {
        ...state,
        supplier: { ...state.supplier, [action.payload.field]: action.payload.value },
      }

    case 'UPDATE_ADDRESS_FIELD':
      return {
        ...state,
        supplier: {
          ...state.supplier,
          address: { ...state.supplier.address, [action.payload.field]: action.payload.value },
        },
      }

    case 'UPDATE_POINT_OF_CONTACT_FIELD':
      return {
        ...state,
        supplier: {
          ...state.supplier,
          pointOfContact: { ...state.supplier.pointOfContact, [action.payload.field]: action.payload.value },
        },
      }

    case 'SET_EDITING_MODE':
      return {
        ...state,
        isEditing: action.payload.isEditing,
        supplierId: action.payload.supplierId,
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

const transformSupplierResponse = (response: SupplierModel & { _id: string }): SupplierModel => ({
  companyName: response.companyName || '',
  contact: response.contact || '',
  whatsAppNumber: response.whatsAppNumber || '',
  email: response.email || '',
  address: {
    addressLine1: response.address?.addressLine1 || '',
    addressLine2: response.address?.addressLine2 || '',
    city: response.address?.city || '',
    state: response.address?.state || '',
    pinCode: response.address?.pinCode || '',
  },
  pointOfContact: {
    name: response.pointOfContact?.name || '',
    designation: response.pointOfContact?.designation || '',
    email: response.pointOfContact?.email || '',
    contact: response.pointOfContact?.contact || '',
  },
  isActive: response.isActive !== undefined ? response.isActive : true,
  comment: response.comment || '',
})

const CreateSupplier: FunctionComponent<CreateSupplierProps> = () => {
  const navigate = useNavigate()
  const params = useParams()

  const [state, dispatch] = useReducer(formReducer, initialState)
  const { supplier, isEditing, supplierId, validationErrors, isValidationError } = state
  const { showToast } = useToast()

  // API Hooks
  const createSupplier = useCreateSupplierMutation()
  const updateSupplier = useUpdateSupplierMutation()
  const { data: supplierDataResponse, isLoading, error: getSupplierDataError } = useSupplierByIdQuery(params.id || '')

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFieldChange = useCallback(<K extends keyof SupplierModel>(field: K, value: SupplierModel[K]) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } })
  }, [])

  const handleAddressFieldChange = useCallback(<K extends keyof SupplierModel['address']>(field: K, value: SupplierModel['address'][K]) => {
    dispatch({ type: 'UPDATE_ADDRESS_FIELD', payload: { field, value } })
  }, [])

  const handlePointOfContactFieldChange = useCallback(<K extends keyof SupplierModel['pointOfContact']>(field: K, value: SupplierModel['pointOfContact'][K]) => {
    dispatch({ type: 'UPDATE_POINT_OF_CONTACT_FIELD', payload: { field, value } })
  }, [])

  const navigateBack = useCallback(() => {
    navigate('/suppliers')
  }, [navigate])

  const handleSubmit = useCallback(async () => {
    // Validate form
    const validationSchema = createValidationSchema(supplier)
    const { isValid, errorMap } = validatePayload(validationSchema, supplier)

    dispatch({
      type: 'SET_VALIDATION_ERRORS',
      payload: { errors: errorMap, hasError: !isValid },
    })

    if (!isValid) {
      console.error('Validation Error', errorMap)
      return
    }

    try {
      const dataToSave = {
        ...supplier,
      }

      if (isEditing) {
        await updateSupplier.mutateAsync({ _id: supplierId, ...dataToSave })
        showToast('Supplier updated successfully!', 'success')
      } else {
        await createSupplier.mutateAsync(dataToSave)
        showToast('New supplier created successfully!', 'success')
      }
      navigateBack()
    } catch (error) {
      console.error('Unable to create/update supplier', error)
      showToast(`Unable to ${isEditing ? 'update' : 'create'} supplier. Please try again.`, 'error')
    }
  }, [supplier, isEditing, supplierId, createSupplier, updateSupplier, showToast, navigateBack])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load supplier data when editing
  useEffect(() => {
    if (supplierDataResponse) {
      const transformedSupplier = transformSupplierResponse(supplierDataResponse)
      dispatch({ type: 'SET_SUPPLIER', payload: transformedSupplier })
      dispatch({
        type: 'SET_EDITING_MODE',
        payload: { isEditing: true, supplierId: params.id || '' },
      })
    }
  }, [supplierDataResponse, params.id])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const breadcrumbData = useMemo(
    () => [
      { label: 'Home', route: '/dashboard' },
      { label: 'Suppliers', route: '/suppliers' },
      { label: isEditing ? 'Update' : 'Create' }
    ],
    [isEditing],
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={isEditing ? 'Update Supplier' : 'New Supplier'}
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
            {getSupplierDataError ? (
              <>
                <Alert
                  type="error"
                  message="Unable to load supplier data. Please try again."
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
                  title="Basic Details"
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Company Name"
                        name="companyName"
                        value={supplier.companyName}
                        changeHandler={value => {
                          handleFieldChange('companyName', value.companyName?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['companyName']}
                        invalid={!!validationErrors['companyName']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Contact"
                        name="contact"
                        value={supplier.contact}
                        changeHandler={value => {
                          handleFieldChange('contact', value.contact?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['contact']}
                        invalid={!!validationErrors['contact']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="WhatsApp Number"
                        name="whatsAppNumber"
                        value={supplier.whatsAppNumber}
                        changeHandler={value => {
                          handleFieldChange('whatsAppNumber', value.whatsAppNumber?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['whatsAppNumber']}
                        invalid={!!validationErrors['whatsAppNumber']}
                      />
                    </Column>
                  </Row>
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Email"
                        name="email"
                        type="email"
                        value={supplier.email}
                        changeHandler={value => {
                          handleFieldChange('email', value.email?.toString() ?? '')
                        }}
                        errorMessage={validationErrors['email']}
                        invalid={!!validationErrors['email']}
                      />
                    </Column>
                  </Row>
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Address Line 1"
                        name="addressLine1"
                        value={supplier.address.addressLine1}
                        changeHandler={value => {
                          handleAddressFieldChange('addressLine1', value.addressLine1?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['address.addressLine1']}
                        invalid={!!validationErrors['address.addressLine1']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Address Line 2"
                        name="addressLine2"
                        value={supplier.address.addressLine2}
                        changeHandler={value => {
                          handleAddressFieldChange('addressLine2', value.addressLine2?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['address.addressLine2']}
                        invalid={!!validationErrors['address.addressLine2']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="City"
                        name="city"
                        value={supplier.address.city}
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
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="State"
                        name="state"
                        value={supplier.address.state}
                        changeHandler={value => {
                          handleAddressFieldChange('state', value.state?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['address.state']}
                        invalid={!!validationErrors['address.state']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Pin Code"
                        name="pinCode"
                        value={supplier.address.pinCode}
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
                  title="Point of Contact"
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Name"
                        name="pointOfContactName"
                        value={supplier.pointOfContact.name}
                        changeHandler={value => {
                          handlePointOfContactFieldChange('name', value.pointOfContactName?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['pointOfContact.name']}
                        invalid={!!validationErrors['pointOfContact.name']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Designation"
                        name="pointOfContactDesignation"
                        value={supplier.pointOfContact.designation}
                        changeHandler={value => {
                          handlePointOfContactFieldChange('designation', value.pointOfContactDesignation?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['pointOfContact.designation']}
                        invalid={!!validationErrors['pointOfContact.designation']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Email"
                        name="pointOfContactEmail"
                        type="email"
                        value={supplier.pointOfContact.email}
                        changeHandler={value => {
                          handlePointOfContactFieldChange('email', value.pointOfContactEmail?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['pointOfContact.email']}
                        invalid={!!validationErrors['pointOfContact.email']}
                      />
                    </Column>
                  </Row>
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Contact"
                        name="pointOfContactContact"
                        value={supplier.pointOfContact.contact}
                        changeHandler={value => {
                          handlePointOfContactFieldChange('contact', value.pointOfContactContact?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors['pointOfContact.contact']}
                        invalid={!!validationErrors['pointOfContact.contact']}
                      />
                    </Column>
                  </Row>
                </Panel>

                <Panel
                  title="Status"
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <Toggle
                        name="isActive"
                        label="Is Active"
                        checked={supplier.isActive}
                        changeHandler={obj => {
                          handleFieldChange('isActive', !!obj.isActive)
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
                    name="comment"
                    className={bemClass([blk, 'margin-bottom'])}
                    value={supplier.comment || ''}
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

export default CreateSupplier
