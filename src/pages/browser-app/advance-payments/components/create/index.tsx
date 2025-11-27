import React, { FunctionComponent, useEffect, useMemo, useCallback, useReducer } from 'react'
import { Button, Column, Panel, Row, SelectInput, TextArea, TextInput, Alert } from '@base'
import { AdvancePaymentModel, StaffModel } from '@types'
import { bemClass, nameToPath, validatePayload } from '@utils'
import { useToast } from '@contexts/ToastContext'

import './style.scss'
import { useNavigate, useParams } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateAdvancePaymentMutation, useUpdateAdvancePaymentMutation, useAdvancePaymentByIdQuery } from '@api/queries/advanced-payment'
import { useStaffByCategory } from '@api/queries/staff'
import { PageHeader } from '@components'
import Loader from '@components/loader'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

const blk = 'create-advance-payment'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

interface CreateAdvancePaymentProps {}

interface SelectOption {
  key: string
  value: string
}

interface ValidationErrors {
  [key: string]: string
}

// State interface for useReducer
interface FormState {
  advancePayment: AdvancePaymentModel
  isEditing: boolean
  advancePaymentId: string
  validationErrors: ValidationErrors
  isValidationError: boolean
  staffSelectOptions: SelectOption[]
}

// Action types for useReducer
type FormAction =
  | { type: 'SET_ADVANCE_PAYMENT'; payload: AdvancePaymentModel }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof AdvancePaymentModel; value: any } }
  | { type: 'SET_EDITING_MODE'; payload: { isEditing: boolean; advancePaymentId: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }
  | { type: 'SET_STAFF_OPTIONS'; payload: SelectOption[] }

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_ADVANCE_PAYMENT: AdvancePaymentModel = {
  staffCategory: '',
  staff: '',
  paymentDate: null,
  paymentMethod: '',
  amount: '',
  comment: '',
} as const

const API_ERROR_MESSAGES = {
  staff: 'Unable to load staff data. Please check your connection and try again.',
} as const

const PLACEHOLDER_VALUES = {
  staff: ['Please wait...', 'Unable to load options', 'No staff found'],
} as const

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================

const initialState: FormState = {
  advancePayment: INITIAL_ADVANCE_PAYMENT,
  isEditing: false,
  advancePaymentId: '',
  validationErrors: {},
  isValidationError: false,
  staffSelectOptions: [],
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_ADVANCE_PAYMENT':
      return { ...state, advancePayment: action.payload }

    case 'UPDATE_FIELD':
      return {
        ...state,
        advancePayment: { ...state.advancePayment, [action.payload.field]: action.payload.value },
      }

    case 'SET_EDITING_MODE':
      return {
        ...state,
        isEditing: action.payload.isEditing,
        advancePaymentId: action.payload.advancePaymentId,
      }

    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload.errors,
        isValidationError: action.payload.hasError,
      }

    case 'SET_STAFF_OPTIONS':
      return {
        ...state,
        staffSelectOptions: action.payload,
      }

    default:
      return state
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDateForInput = (date: Date | null): string => {
  if (!date) return ''
  return new Date(date).toISOString().slice(0, 10)
}

const extractIdFromResponse = (field: any): string => {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object' && field._id) return field._id
  return ''
}

const transformAdvancePaymentResponse = (response: AdvancePaymentModel & { _id: string }): AdvancePaymentModel => ({
  staffCategory: response.staffCategory || '',
  staff: extractIdFromResponse(response.staff),
  paymentDate: response.paymentDate ? new Date(response.paymentDate) : null,
  paymentMethod: response.paymentMethod || '',
  amount: response.amount || '',
  comment: response.comment || '',
})

const getSelectOptions = (
  isLoading: boolean,
  isError: boolean,
  options: SelectOption[],
  loadingText: string,
  errorText: string,
  noDataText: string
): SelectOption[] => {
  if (isLoading) return [{ key: 'loading', value: loadingText }]
  if (isError) return [{ key: 'error', value: errorText }]
  if (options.length > 0) return options
  return [{ key: 'no-data', value: noDataText }]
}

const isPlaceholderValue = (value: string): boolean => {
  return (PLACEHOLDER_VALUES.staff as readonly string[]).includes(value)
}

const CreateAdvancePayment: FunctionComponent<CreateAdvancePaymentProps> = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { showToast } = useToast()

  const [state, dispatch] = useReducer(formReducer, initialState)
  const { advancePayment, isEditing, advancePaymentId, validationErrors, isValidationError, staffSelectOptions } = state

  // API Hooks
  const createAdvancePayment = useCreateAdvancePaymentMutation()
  const updateAdvancePayment = useUpdateAdvancePaymentMutation()
  const { data: advancePaymentDataResponse, isLoading, error: getAdvancePaymentDataError } = useAdvancePaymentByIdQuery(params.id || '')

  // Conditional API query for staff
  const shouldFetchStaff = !!advancePayment.staffCategory
  const staffQuery = useStaffByCategory(shouldFetchStaff ? nameToPath(advancePayment.staffCategory) : '')

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFieldChange = useCallback(<K extends keyof AdvancePaymentModel>(field: K, value: AdvancePaymentModel[K]) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } })
  }, [])

  const navigateBack = useCallback(() => {
    navigate('/advance-payments')
  }, [navigate])

  const handleStaffCategoryChange = useCallback(
    (staffCategory: string) => {
      handleFieldChange('staffCategory', staffCategory)
      handleFieldChange('staff', '') // Reset staff when category changes
    },
    [handleFieldChange],
  )

  const handleStaffChange = useCallback(
    (staffValue: string) => {
      if (isPlaceholderValue(staffValue)) return
      
      const selectedStaff = staffSelectOptions.find(s => s.value === staffValue)
      handleFieldChange('staff', selectedStaff?.key || '')
    },
    [staffSelectOptions, handleFieldChange],
  )

  const handleSubmit = useCallback(async () => {
    // Validate form
    const validationSchema = createValidationSchema(advancePayment)
    const { isValid, errorMap } = validatePayload(validationSchema, advancePayment)

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
        ...advancePayment,
        staffCategory: nameToPath(advancePayment.staffCategory),
      }

      if (isEditing) {
        await updateAdvancePayment.mutateAsync({ _id: advancePaymentId, ...dataToSave })
        showToast('Advance payment updated successfully!', 'success')
      } else {
        await createAdvancePayment.mutateAsync(dataToSave)
        showToast('New advance payment created successfully!', 'success')
      }
      navigateBack()
    } catch (error) {
      console.error('Unable to create/update advance payment', error)
      showToast(`Unable to ${isEditing ? 'update' : 'create'} advance payment. Please try again.`, 'error')
    }
  }, [advancePayment, isEditing, advancePaymentId, createAdvancePayment, updateAdvancePayment, showToast, navigateBack])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load advance payment data when editing
  useEffect(() => {
    if (advancePaymentDataResponse) {
      const transformedAdvancePayment = transformAdvancePaymentResponse(advancePaymentDataResponse)
      dispatch({ type: 'SET_ADVANCE_PAYMENT', payload: transformedAdvancePayment })
      dispatch({
        type: 'SET_EDITING_MODE',
        payload: { isEditing: true, advancePaymentId: params.id || '' },
      })
    }
  }, [advancePaymentDataResponse, params.id])

  // Handle staff data
  useEffect(() => {
    if (staffQuery.data?.data) {
      const options = staffQuery.data.data.map((staff: StaffModel & { _id: string }) => ({
        key: staff._id,
        value: staff.name,
      }))
      dispatch({ type: 'SET_STAFF_OPTIONS', payload: options })
    } else {
      dispatch({ type: 'SET_STAFF_OPTIONS', payload: [] })
    }
  }, [staffQuery.data])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const breadcrumbData = useMemo(
    () => [
      { label: 'Home', route: '/dashboard' },
      { label: 'Advance Payments', route: '/advance-payments' },
      { label: isEditing ? 'Update' : 'Create' }
    ],
    [isEditing],
  )

  const selectedStaffValue = useMemo(() => {
    const staffId = advancePayment.staff
    if (!staffId || !staffSelectOptions.length) return ''
    const option = staffSelectOptions.find(opt => opt.key === staffId)
    return option?.value || ''
  }, [advancePayment.staff, staffSelectOptions])

  const staffOptions = useMemo(
    () =>
      getSelectOptions(
        staffQuery.isLoading,
        staffQuery.isError,
        staffSelectOptions,
        'Please wait...',
        'Unable to load options',
        'No staff found'
      ),
    [staffQuery.isLoading, staffQuery.isError, staffSelectOptions]
  )

  const hasApiErrors = useMemo(
    () => staffQuery.isError,
    [staffQuery.isError]
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={isEditing ? 'Update Advance Payment' : 'New Advance Payment'}
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

      {hasApiErrors && (
        <Alert
          type="error"
          message={`Some data could not be loaded: ${API_ERROR_MESSAGES.staff}`}
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}

      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : (
          <>
            {getAdvancePaymentDataError ? (
              <>
                <Alert
                  type="error"
                  message="Unable to load advance payment data. Please try again."
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
                  title="Staff Details"
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <ConfiguredInput
                        label="Staff Category"
                        name="staffCategory"
                        configToUse="Staff category"
                        type={CONFIGURED_INPUT_TYPES.SELECT}
                        value={advancePayment.staffCategory}
                        changeHandler={value => {
                          handleStaffCategoryChange(value.staffCategory?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors.staffCategory}
                        invalid={!!validationErrors.staffCategory}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <SelectInput
                        label="Staff"
                        name="staff"
                        options={staffOptions}
                        value={selectedStaffValue}
                        changeHandler={value => {
                          handleStaffChange(value.staff?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors.staff}
                        invalid={!!validationErrors.staff}
                        disabled={!advancePayment.staffCategory || staffQuery.isLoading || staffQuery.isError}
                        isLoading={staffQuery.isLoading && !!advancePayment.staffCategory}
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
                        label="Payment Date"
                        name="paymentDate"
                        type="date"
                        value={formatDateForInput(advancePayment.paymentDate)}
                        changeHandler={value => {
                          handleFieldChange('paymentDate', value.paymentDate ? new Date(value.paymentDate) : null)
                        }}
                        required
                        errorMessage={validationErrors.paymentDate}
                        invalid={!!validationErrors.paymentDate}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Amount"
                        name="amount"
                        type="number"
                        value={advancePayment.amount ?? ''}
                        changeHandler={value => {
                          handleFieldChange('amount', value.amount ? Number(value.amount) : '')
                        }}
                        required
                        errorMessage={validationErrors.amount}
                        invalid={!!validationErrors.amount}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <ConfiguredInput
                        label="Payment Method"
                        name="paymentMethod"
                        configToUse="Payment method"
                        type={CONFIGURED_INPUT_TYPES.SELECT}
                        value={advancePayment.paymentMethod}
                        changeHandler={value => {
                          handleFieldChange('paymentMethod', value.paymentMethod?.toString() ?? '')
                        }}
                        required
                        errorMessage={validationErrors.paymentMethod}
                        invalid={!!validationErrors.paymentMethod}
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
                    value={advancePayment.comment}
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
                    disabled={hasApiErrors}
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

export default CreateAdvancePayment
