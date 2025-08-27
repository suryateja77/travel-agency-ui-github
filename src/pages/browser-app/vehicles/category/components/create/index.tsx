import React, { FunctionComponent, useEffect, useMemo, useCallback, useReducer } from 'react'
import { Breadcrumb, Text, Panel, Row, Column, TextInput, Button, SelectInput, TextArea, ConfirmationPopup, Modal, Alert, Toggle } from '@base'
import { VehicleModel, CustomerModel, PackageModel, StaffModel } from '@types'
import { bemClass, nameToPath, pathToName, validatePayload } from '@utils'

import './style.scss'
import { useNavigate, useParams } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateVehicleMutation, useUpdateVehicleMutation, useVehicleByIdQuery } from '@api/queries/vehicle'
import { useCustomerByCategory } from '@api/queries/customer'
import { usePackageByCategory } from '@api/queries/package'
import { useStaffByCategory } from '@api/queries/staff'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'
import Loader from '@components/loader'

const blk = 'create-vehicle'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

interface VehicleResponseModel extends Omit<VehicleModel, 'monthlyFixedDetails'> {
  _id: string
  monthlyFixedDetails?: {
    customerCategory: string | null
    customer: CustomerModel | string | null
    packageCategory: string | null
    package: PackageModel | string | null
    staffCategory: string | null
    staff: StaffModel | string | null
    contractStartDate: Date | null
    contractEndDate: Date | null
  }
}

interface CreateVehicleProps {
  category?: string
}

interface SelectOption {
  key: string
  value: string
}

interface MonthlyFixedDetails {
  customerCategory: string
  customer: string
  packageCategory: string
  package: string
  staffCategory: string
  staff: string
  contractStartDate: Date | null
  contractEndDate: Date | null
}

interface ValidationErrors {
  [key: string]: string
}

interface ApiErrors {
  customers: string
  packages: string
  staff: string
}

interface SelectOptions {
  customers: SelectOption[]
  packages: SelectOption[]
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
  vehicle: VehicleModel
  isEditing: boolean
  vehicleId: string
  validationErrors: ValidationErrors
  isValidationError: boolean
  showConfirmationModal: boolean
  confirmationModal: ConfirmationModal
  apiErrors: ApiErrors
  selectOptions: SelectOptions
}

// Action types for useReducer
type FormAction =
  | { type: 'SET_VEHICLE'; payload: VehicleModel }
  | { type: 'UPDATE_VEHICLE_FIELD'; payload: { field: keyof VehicleModel; value: any } }
  | { type: 'UPDATE_MONTHLY_FIXED_DETAILS'; payload: Partial<MonthlyFixedDetails> }
  | { type: 'SET_EDITING_MODE'; payload: { isEditing: boolean; vehicleId: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }
  | { type: 'SET_CONFIRMATION_MODAL'; payload: Partial<ConfirmationModal> & { show: boolean } }
  | { type: 'SET_API_ERROR'; payload: { dataType: keyof ApiErrors; error: string } }
  | { type: 'SET_SELECT_OPTIONS'; payload: { dataType: keyof SelectOptions; options: SelectOption[] } }

type ApiDataType = keyof SelectOptions

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_VEHICLE: VehicleModel = {
  type: '',
  manufacturer: '',
  name: '',
  noOfSeats: '',
  registrationNo: '',
  hasAc: false,
  isMonthlyFixed: false,
  monthlyFixedDetails: null,
  category: '',
  isActive: true,
  comments: '',
} as const

const INITIAL_MONTHLY_FIXED_DETAILS: MonthlyFixedDetails = {
  customerCategory: '',
  customer: '',
  packageCategory: '',
  package: '',
  staffCategory: '',
  staff: '',
  contractStartDate: null,
  contractEndDate: null,
} as const

const API_ERROR_MESSAGES = {
  customers: 'Unable to load customer data. Please check your connection and try again.',
  packages: 'Unable to load package information. Please check your connection and try again.',
  staff: 'Unable to load staff data. Please check your connection and try again.',
} as const

const PLACEHOLDER_VALUES = {
  customers: ['Please wait...', 'Unable to load options', 'No customers found'],
  packages: ['Please wait...', 'Unable to load options', 'No packages found'],
  staff: ['Please wait...', 'Unable to load options', 'No staff found'],
} as const

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================

const initialState: FormState = {
  vehicle: INITIAL_VEHICLE,
  isEditing: false,
  vehicleId: '',
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
    customers: '',
    packages: '',
    staff: '',
  },
  selectOptions: {
    customers: [],
    packages: [],
    staff: [],
  },
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_VEHICLE':
      return { ...state, vehicle: action.payload }
    
    case 'UPDATE_VEHICLE_FIELD':
      return {
        ...state,
        vehicle: { ...state.vehicle, [action.payload.field]: action.payload.value },
      }
    
    case 'UPDATE_MONTHLY_FIXED_DETAILS':
      return {
        ...state,
        vehicle: {
          ...state.vehicle,
          monthlyFixedDetails: {
            ...INITIAL_MONTHLY_FIXED_DETAILS,
            ...state.vehicle.monthlyFixedDetails,
            ...action.payload,
          },
        },
      }
    
    case 'SET_EDITING_MODE':
      return {
        ...state,
        isEditing: action.payload.isEditing,
        vehicleId: action.payload.vehicleId,
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

const transformVehicleResponse = (response: VehicleResponseModel): VehicleModel => ({
  type: response.type || '',
  manufacturer: response.manufacturer || '',
  name: response.name || '',
  noOfSeats: response.noOfSeats || '',
  registrationNo: response.registrationNo || '',
  hasAc: response.hasAc || false,
  isMonthlyFixed: response.isMonthlyFixed || false,
  monthlyFixedDetails: response.monthlyFixedDetails
    ? {
        customerCategory: response.monthlyFixedDetails.customerCategory || '',
        customer: extractIdFromResponse(response.monthlyFixedDetails.customer),
        packageCategory: response.monthlyFixedDetails.packageCategory || '',
        package: extractIdFromResponse(response.monthlyFixedDetails.package),
        staffCategory: response.monthlyFixedDetails.staffCategory || '',
        staff: extractIdFromResponse(response.monthlyFixedDetails.staff),
        contractStartDate: response.monthlyFixedDetails.contractStartDate 
          ? new Date(response.monthlyFixedDetails.contractStartDate) 
          : null,
        contractEndDate: response.monthlyFixedDetails.contractEndDate 
          ? new Date(response.monthlyFixedDetails.contractEndDate) 
          : null,
      }
    : null,
  category: response.category || '',
  isActive: response.isActive !== undefined ? response.isActive : true,
  comments: response.comments || '',
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

const CreateVehicle: FunctionComponent<CreateVehicleProps> = ({ category = '' }) => {
  const navigate = useNavigate()
  const params = useParams()
  
  const [state, dispatch] = useReducer(formReducer, initialState)
  const {
    vehicle,
    isEditing,
    vehicleId,
    validationErrors,
    isValidationError,
    showConfirmationModal,
    confirmationModal,
    apiErrors,
    selectOptions,
  } = state

  // API Hooks
  const createVehicle = useCreateVehicleMutation()
  const updateVehicle = useUpdateVehicleMutation()
  const { data: vehicleDataResponse, isLoading, error: getVehicleDataError } = useVehicleByIdQuery(params.id || '')

  // Memoized category paths for API calls
  const categoryPaths = useMemo(() => ({
    customer: vehicle.isMonthlyFixed && vehicle.monthlyFixedDetails?.customerCategory
      ? nameToPath(vehicle.monthlyFixedDetails.customerCategory)
      : '',
    package: vehicle.isMonthlyFixed && vehicle.monthlyFixedDetails?.packageCategory
      ? nameToPath(vehicle.monthlyFixedDetails.packageCategory)
      : '',
    staff: vehicle.isMonthlyFixed && vehicle.monthlyFixedDetails?.staffCategory
      ? nameToPath(vehicle.monthlyFixedDetails.staffCategory)
      : '',
  }), [vehicle.isMonthlyFixed, vehicle.monthlyFixedDetails])

  // API Queries with conditional fetching
  const customersQuery = useCustomerByCategory(categoryPaths.customer)
  const packagesQuery = usePackageByCategory(categoryPaths.package)
  const staffQuery = useStaffByCategory(categoryPaths.staff)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleVehicleFieldChange = useCallback(
    <K extends keyof VehicleModel>(field: K, value: VehicleModel[K]) => {
      dispatch({ type: 'UPDATE_VEHICLE_FIELD', payload: { field, value } })
    },
    []
  )

  const handleMonthlyFixedDetailsChange = useCallback((updates: Partial<MonthlyFixedDetails>) => {
    dispatch({ type: 'UPDATE_MONTHLY_FIXED_DETAILS', payload: updates })
  }, [])

  const handleApiResponse = useCallback(
    <T extends { _id: string; name?: string; packageCode?: string }>(
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
    navigate(`/vehicles/${category}`)
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
    const validationSchema = createValidationSchema(vehicle)
    const { isValid, errorMap } = validatePayload(validationSchema, vehicle)

    dispatch({
      type: 'SET_VALIDATION_ERRORS',
      payload: { errors: errorMap, hasError: !isValid },
    })

    if (!isValid) {
      console.error('Validation Error', errorMap)
      return
    }

    // Prepare data for submission
    const dataToSave: VehicleModel = {
      ...vehicle,
      monthlyFixedDetails: vehicle.isMonthlyFixed ? vehicle.monthlyFixedDetails : null,
    }

    try {
      if (isEditing) {
        await updateVehicle.mutateAsync({ _id: vehicleId, ...dataToSave })
        dispatch({
          type: 'SET_CONFIRMATION_MODAL',
          payload: {
            show: true,
            type: 'update',
            title: 'Success',
            subtitle: 'Vehicle updated successfully!',
          },
        })
      } else {
        await createVehicle.mutateAsync({ ...dataToSave, category: nameToPath(category) })
        dispatch({
          type: 'SET_CONFIRMATION_MODAL',
          payload: {
            show: true,
            type: 'create',
            title: 'Success',
            subtitle: 'New Vehicle created successfully!',
          },
        })
      }
    } catch (error) {
      console.error('Unable to create/update vehicle', error)
      dispatch({
        type: 'SET_CONFIRMATION_MODAL',
        payload: {
          show: true,
          type: 'delete',
          title: 'Error',
          subtitle: `Unable to ${isEditing ? 'update' : 'create'} vehicle. Please try again.`,
        },
      })
    }
  }, [apiErrors, vehicle, isEditing, vehicleId, updateVehicle, createVehicle, category])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load vehicle data when editing
  useEffect(() => {
    if (vehicleDataResponse) {
      const transformedVehicle = transformVehicleResponse(vehicleDataResponse)
      dispatch({ type: 'SET_VEHICLE', payload: transformedVehicle })
      dispatch({
        type: 'SET_EDITING_MODE',
        payload: { isEditing: true, vehicleId: params.id || '' },
      })
    }
  }, [vehicleDataResponse, params.id])

  // Handle customers data
  useEffect(() => {
    handleApiResponse(
      customersQuery.data,
      customersQuery.error,
      customersQuery.isError,
      'customers',
      (customer: CustomerModel & { _id: string }) => ({
        key: customer._id,
        value: customer.name,
      })
    )
  }, [customersQuery.data, customersQuery.error, customersQuery.isError, handleApiResponse])

  // Handle packages data
  useEffect(() => {
    handleApiResponse(
      packagesQuery.data,
      packagesQuery.error,
      packagesQuery.isError,
      'packages',
      (pkg: PackageModel & { _id: string }) => ({
        key: pkg._id,
        value: pkg.packageCode,
      })
    )
  }, [packagesQuery.data, packagesQuery.error, packagesQuery.isError, handleApiResponse])

  // Handle staff data
  useEffect(() => {
    handleApiResponse(
      staffQuery.data,
      staffQuery.error,
      staffQuery.isError,
      'staff',
      (staffMember: StaffModel & { _id: string }) => ({
        key: staffMember._id,
        value: staffMember.name,
      })
    )
  }, [staffQuery.data, staffQuery.error, staffQuery.isError, handleApiResponse])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const categoryDisplayName = useMemo(() => pathToName(category), [category])

  const breadcrumbData = useMemo(
    () => [
      { label: 'Home', route: '/dashboard' },
      { label: `${categoryDisplayName} Vehicles`, route: `/vehicles/${category}` },
      { label: `${isEditing ? 'Edit' : 'New'} ${categoryDisplayName} Vehicle` },
    ],
    [categoryDisplayName, category, isEditing]
  )

  const customerSelectOptions = useMemo(
    () =>
      getSelectOptions(
        customersQuery.isLoading,
        customersQuery.isError,
        selectOptions.customers,
        'Please wait...',
        'Unable to load options',
        'No customers found'
      ),
    [customersQuery.isLoading, customersQuery.isError, selectOptions.customers]
  )

  const packageSelectOptions = useMemo(
    () =>
      getSelectOptions(
        packagesQuery.isLoading,
        packagesQuery.isError,
        selectOptions.packages,
        'Please wait...',
        'Unable to load options',
        'No packages found'
      ),
    [packagesQuery.isLoading, packagesQuery.isError, selectOptions.packages]
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

  const selectedCustomerValue = useMemo(() => {
    const customerId = vehicle.monthlyFixedDetails?.customer
    if (!customerId || !selectOptions.customers.length) return ''
    const option = selectOptions.customers.find(opt => opt.key === customerId)
    return option?.value || ''
  }, [vehicle.monthlyFixedDetails?.customer, selectOptions.customers])

  const selectedPackageValue = useMemo(() => {
    const packageId = vehicle.monthlyFixedDetails?.package
    if (!packageId || !selectOptions.packages.length) return ''
    const option = selectOptions.packages.find(opt => opt.key === packageId)
    return option?.value || ''
  }, [vehicle.monthlyFixedDetails?.package, selectOptions.packages])

  const selectedStaffValue = useMemo(() => {
    const staffId = vehicle.monthlyFixedDetails?.staff
    if (!staffId || !selectOptions.staff.length) return ''
    const option = selectOptions.staff.find(opt => opt.key === staffId)
    return option?.value || ''
  }, [vehicle.monthlyFixedDetails?.staff, selectOptions.staff])

  const hasApiErrors = useMemo(
    () => Object.values(apiErrors).some(error => error !== ''),
    [apiErrors]
  )

  // ============================================================================
  // SELECT CHANGE HANDLERS
  // ============================================================================

  const handleCustomerChange = useCallback(
    (value: { customer?: string }) => {
      const customerValue = value.customer?.toString() || ''
      if (isPlaceholderValue(customerValue, 'customers')) return

      const selectedOption = selectOptions.customers.find(option => option.value === customerValue)
      handleMonthlyFixedDetailsChange({ customer: selectedOption?.key || '' })
    },
    [selectOptions.customers, handleMonthlyFixedDetailsChange]
  )

  const handlePackageChange = useCallback(
    (value: { package?: string }) => {
      const packageValue = value.package?.toString() || ''
      if (isPlaceholderValue(packageValue, 'packages')) return

      const selectedOption = selectOptions.packages.find(option => option.value === packageValue)
      handleMonthlyFixedDetailsChange({ package: selectedOption?.key || '' })
    },
    [selectOptions.packages, handleMonthlyFixedDetailsChange]
  )

  const handleStaffChange = useCallback(
    (value: { staff?: string }) => {
      const staffValue = value.staff?.toString() || ''
      if (isPlaceholderValue(staffValue, 'staff')) return

      const selectedOption = selectOptions.staff.find(option => option.value === staffValue)
      handleMonthlyFixedDetailsChange({ staff: selectedOption?.key || '' })
    },
    [selectOptions.staff, handleMonthlyFixedDetailsChange]
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className={bemClass([blk])}>
        <div className={bemClass([blk, 'header'])}>
          <Text color="gray-darker" typography="l">
            {`${isEditing ? 'Edit' : 'New'} ${categoryDisplayName} Vehicle`}
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
          {isLoading ? (
            <Loader type="form" />
          ) : (
            <>
              {getVehicleDataError ? (
                <>
                  <Alert
                    type="error"
                    message="Unable to load vehicle data. Please try again."
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                  <Button size="medium" clickHandler={navigateBack}>
                    Go Back
                  </Button>
                </>
              ) : (
                <>
                  <Panel title="Vehicle Details" className={bemClass([blk, 'margin-bottom'])}>
                    <Row>
                      <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                        <ConfiguredInput
                          label="Vehicle Type"
                          name="type"
                          configToUse="Vehicle type"
                          type={CONFIGURED_INPUT_TYPES.SELECT}
                          value={vehicle.type}
                          changeHandler={value => {
                            handleVehicleFieldChange('type', value.type?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors.type}
                          invalid={!!validationErrors.type}
                        />
                      </Column>
                      <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                        <TextInput
                          label="Manufacturer"
                          name="manufacturer"
                          value={vehicle.manufacturer}
                          changeHandler={value => {
                            handleVehicleFieldChange('manufacturer', value.manufacturer?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors.manufacturer}
                          invalid={!!validationErrors.manufacturer}
                        />
                      </Column>
                      <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                        <TextInput
                          label="Vehicle Name"
                          name="name"
                          value={vehicle.name}
                          changeHandler={value => {
                            handleVehicleFieldChange('name', value.name?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors.name}
                          invalid={!!validationErrors.name}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                        <TextInput
                          label="Number of Seats"
                          name="noOfSeats"
                          type="number"
                          value={vehicle.noOfSeats ?? ''}
                          changeHandler={value => {
                            handleVehicleFieldChange('noOfSeats', value.noOfSeats ? Number(value.noOfSeats) : '')
                          }}
                          required
                          errorMessage={validationErrors.noOfSeats}
                          invalid={!!validationErrors.noOfSeats}
                        />
                      </Column>
                      <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                        <TextInput
                          label="Registration Number"
                          name="registrationNo"
                          value={vehicle.registrationNo}
                          changeHandler={value => {
                            handleVehicleFieldChange('registrationNo', value.registrationNo?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors.registrationNo}
                          invalid={!!validationErrors.registrationNo}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                        <Toggle
                          name="hasAc"
                          label="Is AC Required"
                          checked={vehicle.hasAc}
                          changeHandler={obj => {
                            handleVehicleFieldChange('hasAc', !!obj.hasAc)
                          }}
                        />
                      </Column>
                      <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                        <Toggle
                          name="isMonthlyFixed"
                          label="Is Monthly Fixed"
                          checked={vehicle.isMonthlyFixed}
                          changeHandler={obj => {
                            const isChecked = !!obj.isMonthlyFixed
                            handleVehicleFieldChange('isMonthlyFixed', isChecked)
                            // Only initialize monthlyFixedDetails if it doesn't exist and toggle is turned on
                            if (isChecked && !vehicle.monthlyFixedDetails) {
                              handleVehicleFieldChange('monthlyFixedDetails', INITIAL_MONTHLY_FIXED_DETAILS)
                            }
                          }}
                        />
                      </Column>
                    </Row>
                  </Panel>

                  {vehicle.isMonthlyFixed && (
                    <>
                      <Panel
                        title="Monthly Fixed Customer Details"
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <Row>
                          <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                            <ConfiguredInput
                              label="Customer category"
                              configToUse="Customer category"
                              type={CONFIGURED_INPUT_TYPES.SELECT}
                              name="customerCategory"
                              value={vehicle.monthlyFixedDetails?.customerCategory || ''}
                              changeHandler={value => {
                                handleMonthlyFixedDetailsChange({
                                  customerCategory: value.customerCategory?.toString() ?? '',
                                  customer: '', // Reset customer when category changes
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={validationErrors['monthlyFixedDetails.customerCategory']}
                              invalid={!!validationErrors['monthlyFixedDetails.customerCategory']}
                            />
                          </Column>
                          <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                            <SelectInput
                              label="Customer"
                              name="customer"
                              options={customerSelectOptions}
                              value={selectedCustomerValue}
                              changeHandler={handleCustomerChange}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={validationErrors['monthlyFixedDetails.customer']}
                              invalid={!!validationErrors['monthlyFixedDetails.customer']}
                              disabled={!vehicle.monthlyFixedDetails?.customerCategory || customersQuery.isLoading || customersQuery.isError}
                            />
                          </Column>
                        </Row>
                      </Panel>

                      <Panel
                        title="Monthly Fixed Package Details"
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <Row>
                          <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                            <ConfiguredInput
                              label="Package Category"
                              name="packageCategory"
                              value={vehicle.monthlyFixedDetails?.packageCategory ?? ''}
                              configToUse="Package category"
                              type={CONFIGURED_INPUT_TYPES.SELECT}
                              changeHandler={value => {
                                handleMonthlyFixedDetailsChange({
                                  packageCategory: value.packageCategory?.toString() ?? '',
                                  package: '', // Reset package when category changes
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={validationErrors['monthlyFixedDetails.packageCategory']}
                              invalid={!!validationErrors['monthlyFixedDetails.packageCategory']}
                            />
                          </Column>
                          <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                            <SelectInput
                              label="Package"
                              name="package"
                              options={packageSelectOptions}
                              value={selectedPackageValue}
                              changeHandler={handlePackageChange}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={validationErrors['monthlyFixedDetails.package']}
                              invalid={!!validationErrors['monthlyFixedDetails.package']}
                              disabled={!vehicle.monthlyFixedDetails?.packageCategory || packagesQuery.isLoading || packagesQuery.isError}
                            />
                          </Column>
                        </Row>
                      </Panel>

                      <Panel
                        title="Monthly Fixed Staff Details"
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <Row>
                          <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                            <ConfiguredInput
                              label="Staff Category"
                              name="staffCategory"
                              value={vehicle.monthlyFixedDetails?.staffCategory ?? ''}
                              configToUse="Staff category"
                              type={CONFIGURED_INPUT_TYPES.SELECT}
                              changeHandler={value => {
                                handleMonthlyFixedDetailsChange({
                                  staffCategory: value.staffCategory?.toString() ?? '',
                                  staff: '', // Reset staff when category changes
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={validationErrors['monthlyFixedDetails.staffCategory']}
                              invalid={!!validationErrors['monthlyFixedDetails.staffCategory']}
                            />
                          </Column>
                          <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                            <SelectInput
                              label="Staff"
                              name="staff"
                              options={staffSelectOptions}
                              value={selectedStaffValue}
                              changeHandler={handleStaffChange}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={validationErrors['monthlyFixedDetails.staff']}
                              invalid={!!validationErrors['monthlyFixedDetails.staff']}
                              disabled={!vehicle.monthlyFixedDetails?.staffCategory || staffQuery.isLoading || staffQuery.isError}
                            />
                          </Column>
                        </Row>
                      </Panel>

                      <Panel
                        title="Monthly Fixed Contract Details"
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <Row>
                          <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                            <TextInput
                              label="Contract Start Date"
                              name="contractStartDate"
                              type="date"
                              value={
                                vehicle.monthlyFixedDetails?.contractStartDate
                                  ? new Date(vehicle.monthlyFixedDetails.contractStartDate).toISOString().slice(0, 10)
                                  : ''
                              }
                              changeHandler={value => {
                                handleMonthlyFixedDetailsChange({
                                  contractStartDate: value.contractStartDate ? new Date(value.contractStartDate) : null,
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={validationErrors['monthlyFixedDetails.contractStartDate']}
                              invalid={!!validationErrors['monthlyFixedDetails.contractStartDate']}
                            />
                          </Column>
                          <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                            <TextInput
                              label="Contract End Date"
                              name="contractEndDate"
                              type="date"
                              value={
                                vehicle.monthlyFixedDetails?.contractEndDate
                                  ? new Date(vehicle.monthlyFixedDetails.contractEndDate).toISOString().slice(0, 10)
                                  : ''
                              }
                              changeHandler={value => {
                                handleMonthlyFixedDetailsChange({
                                  contractEndDate: value.contractEndDate ? new Date(value.contractEndDate) : null,
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={validationErrors['monthlyFixedDetails.contractEndDate']}
                              invalid={!!validationErrors['monthlyFixedDetails.contractEndDate']}
                            />
                          </Column>
                        </Row>
                      </Panel>
                    </>
                  )}

                  <Panel title="Comments" className={bemClass([blk, 'margin-bottom'])}>
                    <TextArea
                      className={bemClass([blk, 'margin-bottom'])}
                      name="comments"
                      value={vehicle.comments}
                      changeHandler={value => {
                        handleVehicleFieldChange('comments', value.comments?.toString() ?? '')
                      }}
                      placeholder="Enter any additional comments or notes here..."
                    />
                  </Panel>

                  <Panel title="Is active" className={bemClass([blk, 'margin-bottom'])}>
                    <Row>
                      <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                        <Toggle
                          name="isActive"
                          checked={vehicle.isActive}
                          changeHandler={obj => {
                            handleVehicleFieldChange('isActive', !!obj.isActive)
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

      <Modal show={showConfirmationModal} closeHandler={closeConfirmationModal}>
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

export default CreateVehicle
