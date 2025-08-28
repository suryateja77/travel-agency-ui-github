import React, { FunctionComponent, useEffect, useMemo, useState, useCallback, useReducer } from 'react'
import { Breadcrumb, Text, Panel, Row, Column, TextInput, CheckBox, Button, SelectInput, TextArea, ConfirmationPopup, Modal, Alert, Toggle } from '@base'
import { ExpenseModel } from '@types'
import { bemClass, nameToPath, pathToName, validatePayload } from '@utils'

import './style.scss'
import { useNavigate, useParams } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateExpenseMutation, useUpdateExpenseMutation, useExpenseByIdQuery } from '@api/queries/expense'
import { useVehicleByCategory } from '@api/queries/vehicle'
import { useStaffByCategory } from '@api/queries/staff'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

const blk = 'create-expense'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

interface ExpenseResponseModel extends Omit<ExpenseModel, 'vehicle' | 'staff'> {
  _id: string
  vehicle?: string | { _id: string; name?: string } | null
  staff?: string | { _id: string; name?: string } | null
}

interface CreateExpenseProps {
  category?: string
}

interface SelectOption {
  key: string
  value: string
}

interface ValidationErrors {
  [key: string]: string
}

interface ApiErrors {
  vehicles: string
  staff: string
}

interface SelectOptions {
  vehicles: SelectOption[]
  staff: SelectOption[]
}

interface ConfirmationModal {
  show: boolean
  type: 'create' | 'update' | 'delete'
  title: string
  subtitle: string
}

// State interface for useReducer
interface FormState {
  expense: ExpenseModel
  isEditing: boolean
  expenseId: string
  validationErrors: ValidationErrors
  isValidationError: boolean
  showConfirmationModal: boolean
  confirmationModal: ConfirmationModal
  apiErrors: ApiErrors
  selectOptions: SelectOptions
}

// Action types for useReducer
type FormAction =
  | { type: 'SET_EXPENSE'; payload: ExpenseModel }
  | { type: 'UPDATE_EXPENSE_FIELD'; payload: { field: keyof ExpenseModel; value: any } }
  | { type: 'UPDATE_VEHICLE_DETAILS'; payload: Partial<Pick<ExpenseModel, 'vehicleCategory' | 'vehicle'>> }
  | { type: 'UPDATE_STAFF_DETAILS'; payload: Partial<Pick<ExpenseModel, 'staffCategory' | 'staff'>> }
  | { type: 'SET_EDITING_MODE'; payload: { isEditing: boolean; expenseId: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }
  | { type: 'SET_CONFIRMATION_MODAL'; payload: Partial<ConfirmationModal> & { show: boolean } }
  | { type: 'SET_API_ERROR'; payload: { dataType: keyof ApiErrors; error: string } }
  | { type: 'SET_SELECT_OPTIONS'; payload: { dataType: keyof SelectOptions; options: SelectOption[] } }

type ApiDataType = keyof SelectOptions

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_EXPENSE: ExpenseModel = {
  type: '',
  paymentMethod: '',
  date: null,
  amount: '',
  location: '',
  vehicleCategory: null,
  vehicle: null,
  staffCategory: null,
  staff: null,
  comment: '',
  category: '',
} as const

const API_ERROR_MESSAGES = {
  vehicles: 'Unable to load vehicle data. Please check your connection and try again.',
  staff: 'Unable to load staff data. Please check your connection and try again.',
} as const

const PLACEHOLDER_VALUES = {
  vehicles: ['Please wait...', 'Unable to load options', 'No vehicles found'],
  staff: ['Please wait...', 'Unable to load options', 'No staff found'],
} as const

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================

const initialState: FormState = {
  expense: INITIAL_EXPENSE,
  isEditing: false,
  expenseId: '',
  validationErrors: {},
  isValidationError: false,
  showConfirmationModal: false,
  confirmationModal: {
    show: false,
    type: 'create',
    title: '',
    subtitle: '',
  },
  apiErrors: {
    vehicles: '',
    staff: '',
  },
  selectOptions: {
    vehicles: [],
    staff: [],
  },
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_EXPENSE':
      return { ...state, expense: action.payload }
    
    case 'UPDATE_EXPENSE_FIELD':
      return {
        ...state,
        expense: { ...state.expense, [action.payload.field]: action.payload.value },
      }
    
    case 'UPDATE_VEHICLE_DETAILS':
      return {
        ...state,
        expense: { ...state.expense, ...action.payload },
      }
    
    case 'UPDATE_STAFF_DETAILS':
      return {
        ...state,
        expense: { ...state.expense, ...action.payload },
      }
    
    case 'SET_EDITING_MODE':
      return {
        ...state,
        isEditing: action.payload.isEditing,
        expenseId: action.payload.expenseId,
      }
    
    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload.errors,
        isValidationError: action.payload.hasError,
      }
    
    case 'SET_CONFIRMATION_MODAL':
      return {
        ...state,
        showConfirmationModal: action.payload.show,
        confirmationModal: { ...state.confirmationModal, ...action.payload },
      }
    
    case 'SET_API_ERROR':
      return {
        ...state,
        apiErrors: { ...state.apiErrors, [action.payload.dataType]: action.payload.error },
      }
    
    case 'SET_SELECT_OPTIONS':
      return {
        ...state,
        selectOptions: { ...state.selectOptions, [action.payload.dataType]: action.payload.options },
      }
    
    default:
      return state
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const extractIdFromResponse = (field: any): string => {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object' && field._id) return field._id
  return ''
}

const transformExpenseResponse = (response: ExpenseResponseModel, category: string): ExpenseModel => ({
  type: response.type || '',
  paymentMethod: response.paymentMethod || '',
  date: response.date ? new Date(response.date) : null,
  amount: response.amount || '',
  location: response.location || '',
  vehicleCategory: category === 'vehicle' ? (response.vehicleCategory || '') : null,
  vehicle: category === 'vehicle' ? extractIdFromResponse(response.vehicle) : null,
  staffCategory: category === 'staff' ? (response.staffCategory || '') : null,
  staff: category === 'staff' ? extractIdFromResponse(response.staff) : null,
  comment: response.comment || '',
  category: response.category || nameToPath(category),
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

const isPlaceholderValue = (value: string, type: ApiDataType): boolean => {
  const placeholders = PLACEHOLDER_VALUES[type] as readonly string[]
  return (placeholders as readonly string[]).includes(value)
}

const CreateExpense: FunctionComponent<CreateExpenseProps> = ({ category = '' }) => {
  const navigate = useNavigate()
  const params = useParams()
  
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    expense: {
      ...INITIAL_EXPENSE,
      vehicleCategory: category === 'vehicle' ? '' : null,
      vehicle: category === 'vehicle' ? '' : null,
      staffCategory: category === 'staff' ? '' : null,
      staff: category === 'staff' ? '' : null,
      category: nameToPath(category),
    },
  })
  
  const {
    expense,
    isEditing,
    expenseId,
    validationErrors,
    isValidationError,
    showConfirmationModal,
    confirmationModal,
    apiErrors,
    selectOptions,
  } = state

  // API Hooks
  const createExpense = useCreateExpenseMutation()
  const updateExpense = useUpdateExpenseMutation()
  const { data: expenseDataResponse, isLoading, error: getExpenseDataError } = useExpenseByIdQuery(params.id || '')
  // Memoized category paths for API calls
  const categoryPaths = useMemo(() => ({
    vehicle: category === 'vehicle' && expense.vehicleCategory
      ? nameToPath(expense.vehicleCategory)
      : '',
    staff: category === 'staff' && expense.staffCategory
      ? nameToPath(expense.staffCategory)
      : '',
  }), [category, expense.vehicleCategory, expense.staffCategory])

  // API Queries with conditional fetching
  const vehiclesQuery = useVehicleByCategory(categoryPaths.vehicle)
  const staffQuery = useStaffByCategory(categoryPaths.staff)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleExpenseFieldChange = useCallback(
    <K extends keyof ExpenseModel>(field: K, value: ExpenseModel[K]) => {
      dispatch({ type: 'UPDATE_EXPENSE_FIELD', payload: { field, value } })
    },
    []
  )

  const handleVehicleDetailsChange = useCallback((updates: Partial<Pick<ExpenseModel, 'vehicleCategory' | 'vehicle'>>) => {
    dispatch({ type: 'UPDATE_VEHICLE_DETAILS', payload: updates })
  }, [])

  const handleStaffDetailsChange = useCallback((updates: Partial<Pick<ExpenseModel, 'staffCategory' | 'staff'>>) => {
    dispatch({ type: 'UPDATE_STAFF_DETAILS', payload: updates })
  }, [])

  const handleApiResponse = useCallback(
    <T extends { _id: string; name?: string }>(
      data: { data?: T[] } | undefined,
      error: any,
      isError: boolean,
      dataType: ApiDataType,
      mapFunction: (item: T) => SelectOption
    ) => {
      if (isError && error) {
        dispatch({
          type: 'SET_API_ERROR',
          payload: { dataType, error: API_ERROR_MESSAGES[dataType] },
        })
      } else if (data?.data && data.data.length > 0) {
        const options = data.data.map(mapFunction)
        dispatch({ type: 'SET_SELECT_OPTIONS', payload: { dataType, options } })
      } else {
        dispatch({ type: 'SET_SELECT_OPTIONS', payload: { dataType, options: [] } })
      }
    },
    []
  )

  const navigateBack = useCallback(() => {
    navigate(`/expenses/${category}`)
  }, [navigate, category])

  const closeConfirmationModal = useCallback(() => {
    dispatch({ type: 'SET_CONFIRMATION_MODAL', payload: { show: false } })
  }, [])

  const handleSubmit = useCallback(async () => {
    // Check for API errors
    const hasApiErrors = Object.values(apiErrors).some(error => error !== '')
    if (hasApiErrors) {
      console.error('Cannot submit: API errors present', apiErrors)
      return
    }

    // Validate form
    const validationSchema = createValidationSchema(expense)
    const { isValid, errorMap } = validatePayload(validationSchema, expense)

    dispatch({
      type: 'SET_VALIDATION_ERRORS',
      payload: { errors: errorMap, hasError: !isValid },
    })

    if (!isValid) {
      console.error('Validation Error', errorMap)
      return
    }

    try {
      if (isEditing) {
        await updateExpense.mutateAsync({ _id: expenseId, ...expense })
        dispatch({
          type: 'SET_CONFIRMATION_MODAL',
          payload: {
            show: true,
            type: 'update',
            title: 'Success',
            subtitle: 'Expense updated successfully!',
          },
        })
      } else {
        await createExpense.mutateAsync({ ...expense, category: nameToPath(category) })
        dispatch({
          type: 'SET_CONFIRMATION_MODAL',
          payload: {
            show: true,
            type: 'create',
            title: 'Success',
            subtitle: 'New expense created successfully!',
          },
        })
      }

      setTimeout(() => {
        dispatch({ type: 'SET_CONFIRMATION_MODAL', payload: { show: true } })
      }, 500)
    } catch (error) {
      console.error('Unable to create/update expense', error)
      dispatch({
        type: 'SET_CONFIRMATION_MODAL',
        payload: {
          show: true,
          type: 'delete',
          title: 'Error',
          subtitle: `Unable to ${isEditing ? 'update' : 'create'} expense. Please try again.`,
        },
      })
    }
  }, [apiErrors, expense, isEditing, expenseId, updateExpense, createExpense, category])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load expense data when editing
  useEffect(() => {
    if (expenseDataResponse) {
      const transformedExpense = transformExpenseResponse(expenseDataResponse, category)
      dispatch({ type: 'SET_EXPENSE', payload: transformedExpense })
      dispatch({
        type: 'SET_EDITING_MODE',
        payload: { isEditing: true, expenseId: params.id || '' },
      })
    }
  }, [expenseDataResponse, params.id, category])

  // Handle vehicles data
  useEffect(() => {
    if (category === 'vehicle') {
      handleApiResponse(
        vehiclesQuery.data,
        vehiclesQuery.error,
        vehiclesQuery.isError,
        'vehicles',
        (vehicle: { _id: string; name: string }) => ({
          key: vehicle._id,
          value: vehicle.name,
        })
      )
    }
  }, [vehiclesQuery.data, vehiclesQuery.error, vehiclesQuery.isError, category, handleApiResponse])

  // Handle staff data
  useEffect(() => {
    if (category === 'staff') {
      handleApiResponse(
        staffQuery.data,
        staffQuery.error,
        staffQuery.isError,
        'staff',
        (staffMember: { _id: string; name: string }) => ({
          key: staffMember._id,
          value: staffMember.name,
        })
      )
    }
  }, [staffQuery.data, staffQuery.error, staffQuery.isError, category, handleApiResponse])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const categoryDisplayName = useMemo(() => pathToName(category), [category])

  const breadcrumbData = useMemo(
    () => [
      { label: 'Home', route: '/dashboard' },
      { label: `${categoryDisplayName} Expenses`, route: `/expenses/${category}` },
      { label: `${isEditing ? 'Edit' : 'New'} ${categoryDisplayName} Expense` },
    ],
    [categoryDisplayName, category, isEditing]
  )

  const vehicleSelectOptions = useMemo(
    () =>
      getSelectOptions(
        vehiclesQuery.isLoading,
        vehiclesQuery.isError,
        selectOptions.vehicles,
        'Please wait...',
        'Unable to load options',
        'No vehicles found'
      ),
    [vehiclesQuery.isLoading, vehiclesQuery.isError, selectOptions.vehicles]
  )

  const staffSelectOptions = useMemo(
    () =>
      getSelectOptions(
        staffQuery.isLoading,
        staffQuery.isError,
        selectOptions.staff,
        'Please wait...',
        'Unable to load options',
        'No staff found'
      ),
    [staffQuery.isLoading, staffQuery.isError, selectOptions.staff]
  )

  const selectedVehicleValue = useMemo(() => {
    const vehicleId = expense.vehicle
    if (!vehicleId || !selectOptions.vehicles.length) return ''
    const option = selectOptions.vehicles.find(opt => opt.key === vehicleId)
    return option?.value || ''
  }, [expense.vehicle, selectOptions.vehicles])

  const selectedStaffValue = useMemo(() => {
    const staffId = expense.staff
    if (!staffId || !selectOptions.staff.length) return ''
    const option = selectOptions.staff.find(opt => opt.key === staffId)
    return option?.value || ''
  }, [expense.staff, selectOptions.staff])

  const hasApiErrors = useMemo(
    () => Object.values(apiErrors).some(error => error !== ''),
    [apiErrors]
  )

  // ============================================================================
  // SELECT CHANGE HANDLERS
  // ============================================================================

  const handleVehicleChange = useCallback(
    (value: { vehicle?: string }) => {
      const vehicleValue = value.vehicle?.toString() || ''
      if (isPlaceholderValue(vehicleValue, 'vehicles')) return

      const selectedOption = selectOptions.vehicles.find(option => option.value === vehicleValue)
      handleVehicleDetailsChange({ vehicle: selectedOption?.key || '' })
    },
    [selectOptions.vehicles, handleVehicleDetailsChange]
  )

  const handleStaffChange = useCallback(
    (value: { staff?: string }) => {
      const staffValue = value.staff?.toString() || ''
      if (isPlaceholderValue(staffValue, 'staff')) return

      const selectedOption = selectOptions.staff.find(option => option.value === staffValue)
      handleStaffDetailsChange({ staff: selectedOption?.key || '' })
    },
    [selectOptions.staff, handleStaffDetailsChange]
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className={bemClass([blk])}>
        <div className={bemClass([blk, 'header'])}>
          <Text
            color="gray-darker"
            typography="l"
          >
            {`${isEditing ? 'Edit' : 'New'} ${categoryDisplayName} Expense`}
          </Text>
          <Breadcrumb data={breadcrumbData} />
        </div>
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
            message={`Some data could not be loaded: ${Object.values(apiErrors).filter(Boolean).join(' ')}`}
            className={bemClass([blk, 'margin-bottom'])}
          />
        )}
        <div className={bemClass([blk, 'content'])}>
          <Panel
            title="Expense Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <ConfiguredInput
                  label="Expense Type"
                  name="type"
                  configToUse='Expense type'
                  type={CONFIGURED_INPUT_TYPES.SELECT}
                  value={expense.type}
                  changeHandler={value => {
                    handleExpenseFieldChange('type', value.type?.toString() ?? '')
                  }}
                  required
                  errorMessage={validationErrors['type']}
                  invalid={!!validationErrors['type']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <ConfiguredInput
                  label="Payment Mode"
                  name="paymentMethod"
                  configToUse='Payment method'
                  type={CONFIGURED_INPUT_TYPES.SELECT}
                  value={expense.paymentMethod}
                  changeHandler={value => {
                    handleExpenseFieldChange('paymentMethod', value.paymentMethod?.toString() ?? '')
                  }}
                  required
                  errorMessage={validationErrors['paymentMethod']}
                  invalid={!!validationErrors['paymentMethod']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Expense Date"
                  name="date"
                  type="date"
                  value={expense.date ? new Date(expense.date).toISOString().slice(0, 10) : ''}
                  changeHandler={value => {
                    handleExpenseFieldChange('date', value.date ? new Date(value.date) : null)
                  }}
                  required
                  errorMessage={validationErrors['date']}
                  invalid={!!validationErrors['date']}
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Expense Amount"
                  name="amount"
                  type="number"
                  value={expense.amount ?? ''}
                  changeHandler={value => {
                    handleExpenseFieldChange('amount', value.amount ? Number(value.amount) : '')
                  }}
                  required
                  errorMessage={validationErrors['amount']}
                  invalid={!!validationErrors['amount']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Location"
                  name="location"
                  value={expense.location}
                  changeHandler={value => {
                    handleExpenseFieldChange('location', value.location?.toString() ?? '')
                  }}
                  required
                  errorMessage={validationErrors['location']}
                  invalid={!!validationErrors['location']}
                />
              </Column>
            </Row>
          </Panel>

          {category === 'vehicle' && (
            <Panel
              title="Vehicle Details"
              className={bemClass([blk, 'margin-bottom'])}
            >
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <ConfiguredInput
                    label="Vehicle Category"
                    configToUse="Vehicle category"
                    type={CONFIGURED_INPUT_TYPES.SELECT}
                    name="vehicleCategory"
                    value={expense.vehicleCategory || ''}
                    changeHandler={value => {
                      handleVehicleDetailsChange({
                        vehicleCategory: value.vehicleCategory?.toString() ?? '',
                        vehicle: '' // Reset vehicle when category changes
                      })
                    }}
                    required
                    errorMessage={validationErrors['vehicleCategory']}
                    invalid={!!validationErrors['vehicleCategory']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Vehicle"
                    name="vehicle"
                    options={vehicleSelectOptions}
                    value={selectedVehicleValue}
                    changeHandler={handleVehicleChange}
                    required
                    errorMessage={validationErrors['vehicle']}
                    invalid={!!validationErrors['vehicle']}
                    disabled={!expense.vehicleCategory || vehiclesQuery.isLoading || vehiclesQuery.isError}
                  />
                </Column>
              </Row>
            </Panel>
          )}

          {category === 'staff' && (
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
                    value={expense.staffCategory ?? ''}
                    configToUse="Staff category"
                    type={CONFIGURED_INPUT_TYPES.SELECT}
                    changeHandler={value => {
                      handleStaffDetailsChange({
                        staffCategory: value.staffCategory?.toString() ?? '',
                        staff: '' // Reset staff when category changes
                      })
                    }}
                    required
                    errorMessage={validationErrors['staffCategory']}
                    invalid={!!validationErrors['staffCategory']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Staff"
                    name="staff"
                    options={staffSelectOptions}
                    value={selectedStaffValue}
                    changeHandler={handleStaffChange}
                    required
                    errorMessage={validationErrors['staff']}
                    invalid={!!validationErrors['staff']}
                    disabled={!expense.staffCategory || staffQuery.isLoading || staffQuery.isError}
                  />
                </Column>
              </Row>
            </Panel>
          )}

          <Panel
            title="Comments"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <TextArea
              className={bemClass([blk, 'margin-bottom'])}
              name="comment"
              value={expense.comment}
              changeHandler={value => {
                handleExpenseFieldChange('comment', value.comment?.toString() ?? '')
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
        </div>
      </div>
      <Modal
        show={showConfirmationModal}
        closeHandler={closeConfirmationModal}
      >
        <ConfirmationPopup
          type={confirmationModal.type}
          title={confirmationModal.title}
          subTitle={confirmationModal.subtitle}
          confirmButtonText="Okay"
          confirmHandler={['create', 'update'].includes(confirmationModal.type) ? navigateBack : closeConfirmationModal}
        />
      </Modal>
    </>
  )
}

export default CreateExpense
