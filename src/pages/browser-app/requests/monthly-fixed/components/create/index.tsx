import React, { FunctionComponent, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { createValidationSchema, calculateTotalValidationSchema } from './validation'
import { bemClass, validatePayload, nameToPath, formatDateTimeForInput, parseDateTimeFromInput } from '@utils'
import { Breadcrumb, Button, CheckBox, Column, Panel, RadioGroup, Row, SelectInput, Text, TextArea, TextInput, Alert, Modal, ConfirmationPopup, ReadOnlyText } from '@base'
import { MonthlyFixedRequestModel } from '@types'
import { ConfiguredInput } from '@base'
import { useVehicleByCategory } from '@api/queries/vehicle'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'
import { useSuppliersQuery } from '@api/queries/supplier'
import { usePackageByCategory } from '@api/queries/package'
import { useStaffByCategory } from '@api/queries/staff'
import { useCustomerByCategory, useCustomerByIdQuery } from '@api/queries/customer'
import { useCreateFixedRequestMutation, useUpdateFixedRequestMutation, useFixedRequestByIdQuery } from '@api/queries/fixed-request'

import './style.scss'

const blk = 'create-monthly-fixed-request'

const extractIdFromResponse = (field: any): string => {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object' && field._id) return field._id
  return ''
}

const transformMonthlyFixedRequestResponse = (response: any): MonthlyFixedRequestModel => {
  return {
    customerCategory: response.customerCategory || '',
    customer: extractIdFromResponse(response.customer),
    vehicleType: response.vehicleType || 'regular',
    staffType: response.staffType || 'regular',
    requestType: response.requestType || '',
    pickUpLocation: response.pickUpLocation || '',
    dropOffLocation: response.dropOffLocation || '',
    pickUpDateTime: response.pickUpDateTime ? new Date(response.pickUpDateTime) : null,
    dropDateTime: response.dropDateTime ? new Date(response.dropDateTime) : null,
    openingKm: response.openingKm || null,
    closingKm: response.closingKm || null,
    totalKm: response.totalKm || null,
    totalHr: response.totalHr || null,
    ac: response.ac || false,
    vehicleCategory: response.vehicleCategory || null,
    vehicle: extractIdFromResponse(response.vehicle),
    supplier: extractIdFromResponse(response.supplier),
    supplierPackage: extractIdFromResponse(response.supplierPackage),
    vehicleDetails: response.vehicleDetails || null,
    packageFromProvidedVehicle: response.packageFromProvidedVehicle ? {
      packageCategory: response.packageFromProvidedVehicle.packageCategory || '',
      packageId: extractIdFromResponse(response.packageFromProvidedVehicle.package),
    } : undefined,
    staffCategory: response.staffCategory || null,
    staff: extractIdFromResponse(response.staff),
    staffDetails: response.staffDetails || null,
    otherCharges: {
      toll: {
        amount: response.otherCharges?.toll?.amount || 0,
        isChargeableToCustomer: response.otherCharges?.toll?.isChargeableToCustomer || false,
      },
      parking: {
        amount: response.otherCharges?.parking?.amount || 0,
        isChargeableToCustomer: response.otherCharges?.parking?.isChargeableToCustomer || false,
      },
      nightHalt: {
        amount: response.otherCharges?.nightHalt?.amount || 0,
        isChargeableToCustomer: response.otherCharges?.nightHalt?.isChargeableToCustomer || false,
        isPayableWithSalary: response.otherCharges?.nightHalt?.isPayableWithSalary || false,
      },
      driverAllowance: {
        amount: response.otherCharges?.driverAllowance?.amount || 0,
        isChargeableToCustomer: response.otherCharges?.driverAllowance?.isChargeableToCustomer || false,
        isPayableWithSalary: response.otherCharges?.driverAllowance?.isPayableWithSalary || false,
      },
    },
    advancePayment: {
      advancedFromCustomer: response.advancePayment?.advancedFromCustomer || 0,
      advancedToDriver: response.advancePayment?.advancedToDriver || 0,
    },
    comment: response.comment || '',
  }
}

interface CreateMonthlyFixedRequestProps {}

const sampleMonthlyFixedRequestModel: MonthlyFixedRequestModel = {
  customerCategory: '',
  customer: '',
  vehicleType: 'regular',
  staffType: 'regular',
  requestType: '',
  pickUpLocation: '',
  dropOffLocation: '',
  pickUpDateTime: null,
  dropDateTime: null,
  openingKm: null,
  closingKm: null,
  totalKm: null,
  totalHr: null,
  ac: false,
  vehicleCategory: null,
  vehicle: null,
  supplier: null,
  supplierPackage: null,
  vehicleDetails: null,
  packageFromProvidedVehicle: undefined,
  staffCategory: null,
  staff: null,
  staffDetails: null,
  otherCharges: {
    toll: {
      amount: 0,
      isChargeableToCustomer: false,
    },
    parking: {
      amount: 0,
      isChargeableToCustomer: false,
    },
    nightHalt: {
      amount: 0,
      isChargeableToCustomer: false,
      isPayableWithSalary: false,
    },
    driverAllowance: {
      amount: 0,
      isChargeableToCustomer: false,
      isPayableWithSalary: false,
    },
  },
  advancePayment: {
    advancedFromCustomer: 0,
    advancedToDriver: 0,
  },
  comment: '',
}

const CreateMonthlyFixedRequest: FunctionComponent<CreateMonthlyFixedRequestProps> = () => {
  const { id } = useParams<{ id: string }>()

  const isEditing = Boolean(id)
  const requestId = id || ''

  const { data: monthlyFixedRequestData, isLoading: isLoadingRequest, error: monthlyFixedRequestError, isError: monthlyFixedRequestIsError } = useFixedRequestByIdQuery(requestId)

  const updateMonthlyFixedRequest = useUpdateFixedRequestMutation()
  const createMonthlyFixedRequest = useCreateFixedRequestMutation()
  const navigate = useNavigate()

  const navigateBack = () => {
    navigate('/requests/monthly-fixed')
  }

  const closeConfirmationPopUp = () => {
    if (showConfirmationModal) {
      setShowConfirmationModal(false)
    }
  }

  // Helper functions for calculations
  const formatMinutesToDuration = (totalMinutes: number | null): string => {
    if (!totalMinutes || totalMinutes <= 0) return ''

    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.floor(totalMinutes % 60)

    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
  }
  const [monthlyFixedRequest, setMonthlyFixedRequest] = useState<MonthlyFixedRequestModel>({
    customerCategory: '',
    customer: '',
    vehicleType: 'regular',
    staffType: 'regular',
    requestType: '',
    pickUpLocation: '',
    dropOffLocation: '',
    pickUpDateTime: null,
    dropDateTime: null,
    openingKm: null,
    closingKm: null,
    totalKm: null,
    totalHr: null,
    ac: false,
    vehicleCategory: null,
    vehicle: null,
    supplier: null,
    supplierPackage: null,
    vehicleDetails: null,
    packageFromProvidedVehicle: undefined,
    staffCategory: null,
    staff: null,
    staffDetails: null,
    otherCharges: {
      toll: {
        amount: 0,
        isChargeableToCustomer: false,
      },
      parking: {
        amount: 0,
        isChargeableToCustomer: false,
      },
      nightHalt: {
        amount: 0,
        isChargeableToCustomer: false,
        isPayableWithSalary: false,
      },
      driverAllowance: {
        amount: 0,
        isChargeableToCustomer: false,
        isPayableWithSalary: false,
      },
    },
    advancePayment: {
      advancedFromCustomer: 0,
      advancedToDriver: 0,
    },
    comment: '',
  })

  // Load data when in edit mode
  useEffect(() => {
    if (isEditing && monthlyFixedRequestData && !monthlyFixedRequestIsError) {
      const transformedData = transformMonthlyFixedRequestResponse(monthlyFixedRequestData)
      setMonthlyFixedRequest(transformedData)
    }
  }, [isEditing, monthlyFixedRequestData, monthlyFixedRequestIsError])

  // Category paths for API queries
  const vehicleCategoryPath = React.useMemo(() => {
    return monthlyFixedRequest.vehicleCategory ? nameToPath(monthlyFixedRequest.vehicleCategory) : ''
  }, [monthlyFixedRequest.vehicleCategory])

  const staffCategoryPath = React.useMemo(() => {
    return monthlyFixedRequest.staffCategory ? nameToPath(monthlyFixedRequest.staffCategory) : ''
  }, [monthlyFixedRequest.staffCategory])

  const customerCategoryPath = React.useMemo(() => {
    return monthlyFixedRequest.customerCategory ? nameToPath(monthlyFixedRequest.customerCategory) : ''
  }, [monthlyFixedRequest.customerCategory])

  const providerPackageCategoryPath = React.useMemo(() => {
    return monthlyFixedRequest.packageFromProvidedVehicle?.packageCategory ? nameToPath(monthlyFixedRequest.packageFromProvidedVehicle.packageCategory) : ''
  }, [monthlyFixedRequest.packageFromProvidedVehicle?.packageCategory])

  // API queries
  const { data: vehicles, error: vehiclesError, isLoading: vehiclesLoading, isError: vehiclesIsError } = useVehicleByCategory(vehicleCategoryPath)

  const { data: suppliers, error: suppliersError, isLoading: suppliersLoading, isError: suppliersIsError } = useSuppliersQuery()

  const { data: staffMembers, error: staffError, isLoading: staffLoading, isError: staffIsError } = useStaffByCategory(staffCategoryPath)

  const { data: customers, error: customersError, isLoading: customersLoading, isError: customersIsError } = useCustomerByCategory(customerCategoryPath)

  const { data: supplierVehicles, error: supplierVehiclesError, isLoading: supplierVehiclesLoading, isError: supplierVehiclesIsError } = useVehicleByCategory('supplier')

  const { data: supplierPackages, error: supplierPackagesError, isLoading: supplierPackagesLoading, isError: supplierPackagesIsError } = usePackageByCategory('supplier')

  const { data: providerPackages, error: providerPackagesError, isLoading: providerPackagesLoading, isError: providerPackagesIsError } = usePackageByCategory(providerPackageCategoryPath)

  // Customer details query for monthlyFixedDetails validation
  const { data: selectedCustomerData, error: selectedCustomerError, isError: selectedCustomerIsError } = useCustomerByIdQuery(monthlyFixedRequest.customer)

  const [vehicleOptions, setVehicleOptions] = React.useState<{ key: any; value: any }[]>([])

  const [supplierOptions, setSupplierOptions] = React.useState<{ key: any; value: any }[]>([])
  const [supplierVehicleOptions, setSupplierVehicleOptions] = React.useState<{ key: any; value: any }[]>([])
  const [supplierPackageOptions, setSupplierPackageOptions] = React.useState<{ key: any; value: any }[]>([])
  const [providerPackageOptions, setProviderPackageOptions] = React.useState<{ key: any; value: any }[]>([])
  const [staffOptions, setStaffOptions] = React.useState<{ key: any; value: any }[]>([])
  const [customerOptions, setCustomerOptions] = React.useState<{ key: any; value: any }[]>([])

  // API Error states
  const [apiErrors, setApiErrors] = React.useState({
    vehicles: '',
    suppliers: '',
    staff: '',
    customers: '',
    supplierVehicles: '',
    supplierPackages: '',
    providerPackages: '',
    selectedCustomer: '',
    monthlyFixedRequest: '',
  })

  // Confirmation modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Success')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New monthly fixed request created successfully!')

  // Validation states
  const [monthlyFixedRequestErrorMap, setMonthlyFixedRequestErrorMap] = React.useState<Record<string, any>>({})
  const [isValidationError, setIsValidationError] = React.useState(false)

  // Customer alert states
  const [customerAlert, setCustomerAlert] = React.useState<string>('')

  // Generic function to handle API responses and errors
  const handleApiResponse = (
    data: any,
    error: any,
    isError: boolean,
    errorKey: 'vehicles' | 'suppliers' | 'staff' | 'customers' | 'supplierVehicles' | 'supplierPackages' | 'providerPackages' | 'selectedCustomer' | 'monthlyFixedRequest',
    setOptions: React.Dispatch<React.SetStateAction<{ key: any; value: any }[]>> | null,
    mapFunction: (item: any) => { key: any; value: any },
  ) => {
    if (isError) {
      const userFriendlyMessages = {
        vehicles: 'Unable to load vehicle data. Please check your connection and try again.',
        suppliers: 'Unable to load supplier data. Please check your connection and try again.',
        staff: 'Unable to load staff data. Please check your connection and try again.',
        customers: 'Unable to load customer data. Please check your connection and try again.',
        supplierVehicles: 'Unable to load supplier vehicle data. Please check your connection and try again.',
        supplierPackages: 'Unable to load supplier package data. Please check your connection and try again.',
        providerPackages: 'Unable to load provider package data. Please check your connection and try again.',
        selectedCustomer: 'Unable to load selected customer data. Please check your connection and try again.',
        monthlyFixedRequest: 'Unable to load monthly fixed request data. Please check your connection and try again.',
      }
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: userFriendlyMessages[errorKey],
      }))
      if (setOptions) setOptions([])
    } else if (data?.data?.length > 0 && setOptions) {
      const options = data.data.map(mapFunction)
      setOptions(options)
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: '',
      }))
    } else {
      if (setOptions) setOptions([])
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: '',
      }))
    }
  }

  // useEffect hooks to handle API responses
  React.useEffect(() => {
    handleApiResponse(vehicles, vehiclesError, vehiclesIsError, 'vehicles', setVehicleOptions, (vehicle: { _id: any; name: any }) => ({ key: vehicle._id, value: vehicle.name }))
  }, [vehicles, vehiclesError, vehiclesIsError])

  React.useEffect(() => {
    handleApiResponse(suppliers, suppliersError, suppliersIsError, 'suppliers', setSupplierOptions, (supplier: { _id: any; companyName: any }) => ({
      key: supplier._id,
      value: supplier.companyName,
    }))
  }, [suppliers, suppliersError, suppliersIsError])

  React.useEffect(() => {
    handleApiResponse(staffMembers, staffError, staffIsError, 'staff', setStaffOptions, (staffMember: { _id: any; name: any }) => ({
      key: staffMember._id,
      value: staffMember.name,
    }))
  }, [staffMembers, staffError, staffIsError])

  React.useEffect(() => {
    handleApiResponse(customers, customersError, customersIsError, 'customers', setCustomerOptions, (customer: { _id: any; name: any }) => ({
      key: customer._id,
      value: customer.name,
    }))
  }, [customers, customersError, customersIsError])

  React.useEffect(() => {
    handleApiResponse(supplierVehicles, supplierVehiclesError, supplierVehiclesIsError, 'supplierVehicles', setSupplierVehicleOptions, (vehicle: { _id: any; name: any }) => ({ key: vehicle._id, value: vehicle.name }))
  }, [supplierVehicles, supplierVehiclesError, supplierVehiclesIsError])

  React.useEffect(() => {
    handleApiResponse(supplierPackages, supplierPackagesError, supplierPackagesIsError, 'supplierPackages', setSupplierPackageOptions, (pkg: { _id: any; packageCode: any }) => ({ key: pkg._id, value: pkg.packageCode }))
  }, [supplierPackages, supplierPackagesError, supplierPackagesIsError])

  React.useEffect(() => {
    if (!isEditing) {
      handleApiResponse(selectedCustomerData, selectedCustomerError, selectedCustomerIsError, 'selectedCustomer', null, (item: any) => ({ key: '', value: '' }))
    }
  }, [selectedCustomerData, selectedCustomerError, selectedCustomerIsError, isEditing])

  // Auto-calculate totalKm when openingKm or closingKm changes
  React.useEffect(() => {
    const totalKm = monthlyFixedRequest.closingKm && monthlyFixedRequest.openingKm ? monthlyFixedRequest.closingKm - monthlyFixedRequest.openingKm : 0
    setMonthlyFixedRequest(prev => ({
      ...prev,
      totalKm: totalKm > 0 ? totalKm : null,
    }))
  }, [monthlyFixedRequest.openingKm, monthlyFixedRequest.closingKm])

  // Auto-calculate totalHr when pickUpDateTime or dropDateTime changes
  React.useEffect(() => {
    const totalHr = monthlyFixedRequest.pickUpDateTime && monthlyFixedRequest.dropDateTime ? (new Date(monthlyFixedRequest.dropDateTime).getTime() - new Date(monthlyFixedRequest.pickUpDateTime).getTime()) / (1000 * 60) : 0
    setMonthlyFixedRequest(prev => ({
      ...prev,
      totalHr: totalHr > 0 ? totalHr : null,
    }))
  }, [monthlyFixedRequest.pickUpDateTime, monthlyFixedRequest.dropDateTime])

  // Check customer monthlyFixedDetails and show alerts
  React.useEffect(() => {
    const customerData = isEditing ? monthlyFixedRequestData?.customer : selectedCustomerData?.data
    const customerError = isEditing ? monthlyFixedRequestIsError : selectedCustomerIsError

    if (customerData && !customerError && (monthlyFixedRequest.vehicleType === 'regular' || monthlyFixedRequest.staffType === 'regular')) {
      const customer = customerData
      const hasMonthlyFixedDetails = customer.monthlyFixedDetails && customer.monthlyFixedDetails !== null
      const hasVehicle = hasMonthlyFixedDetails && customer.monthlyFixedDetails.vehicle
      const hasStaff = hasMonthlyFixedDetails && customer.monthlyFixedDetails.staff

      let alertMessage = ''

      if (monthlyFixedRequest.vehicleType === 'regular' && monthlyFixedRequest.staffType === 'regular') {
        // Both vehicle and staff are regular
        if (!hasMonthlyFixedDetails || !hasVehicle || !hasStaff) {
          alertMessage = 'The regular vehicle and staff is not available for the selected customer.'
        }
      } else if (monthlyFixedRequest.vehicleType === 'regular') {
        // Only vehicle is regular
        if (!hasMonthlyFixedDetails || !hasVehicle) {
          alertMessage = 'The regular vehicle is not available for the selected customer.'
        }
      } else if (monthlyFixedRequest.staffType === 'regular') {
        // Only staff is regular
        if (!hasMonthlyFixedDetails || !hasStaff) {
          alertMessage = 'The regular staff is not available for the selected customer.'
        }
      }

      setCustomerAlert(alertMessage)
    } else if (customerError) {
      // Clear alert if there's an error fetching customer data
      setCustomerAlert('')
    } else {
      setCustomerAlert('')
    }
  }, [isEditing, monthlyFixedRequestData, selectedCustomerData, monthlyFixedRequestIsError, selectedCustomerIsError, monthlyFixedRequest.vehicleType, monthlyFixedRequest.staffType])

  // Clear customer alert when vehicle or staff type changes away from regular
  React.useEffect(() => {
    if (monthlyFixedRequest.vehicleType !== 'regular' && monthlyFixedRequest.staffType !== 'regular') {
      setCustomerAlert('')
    }
  }, [monthlyFixedRequest.vehicleType, monthlyFixedRequest.staffType])

  // Generate options for SelectInput based on loading/error states
  const getSelectOptions = (isLoading: boolean, isError: boolean, options: { key: any; value: any }[], loadingText: string, errorText: string, noDataText: string) => {
    if (isLoading) return [{ key: 'loading', value: loadingText }]
    if (isError) return [{ key: 'error', value: errorText }]
    if (options.length > 0) return options
    return [{ key: 'no-data', value: noDataText }]
  }

  // Check if a value should be ignored in change handlers
  const isPlaceholderValue = (value: string, type: 'vehicles' | 'suppliers' | 'staff' | 'customers' | 'supplierVehicles' | 'supplierPackages' | 'providerPackages') => {
    const placeholders = {
      vehicles: ['Please wait...', 'Unable to load options', 'No vehicles found'],
      suppliers: ['Please wait...', 'Unable to load options', 'No suppliers found'],
      staff: ['Please wait...', 'Unable to load options', 'No staff found'],
      customers: ['Please wait...', 'Unable to load options', 'No customers found'],
      supplierVehicles: ['Please wait...', 'Unable to load options', 'No supplier vehicles found'],
      supplierPackages: ['Please wait...', 'Unable to load options', 'No supplier packages found'],
      providerPackages: ['Please wait...', 'Unable to load options', 'No provider packages found'],
    }
    return placeholders[type].includes(value)
  }
  const submitHandler = async () => {
    // Check for API errors before validation
    const hasApiErrors = Object.values(apiErrors).some(error => error !== '')
    if (hasApiErrors) {
      console.log('Cannot submit: API errors present', apiErrors)
      return
    }

    const validationSchema = createValidationSchema(monthlyFixedRequest)
    const { isValid, errorMap } = validatePayload(validationSchema, monthlyFixedRequest)

    setIsValidationError(!isValid)
    setMonthlyFixedRequestErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)

      // Check for customer alert before proceeding
      if (customerAlert) {
        console.log('Cannot submit: Customer alert present', customerAlert)
        return
      }

      // Prepare the request data
      let requestData = { ...monthlyFixedRequest }

      // Assign vehicle and staff from customer's monthlyFixedDetails if they are regular
      const customerDetails = isEditing ? monthlyFixedRequestData?.customer : selectedCustomerData?.data
      if (customerDetails?.monthlyFixedDetails) {
        if (monthlyFixedRequest.vehicleType === 'regular' && customerDetails.monthlyFixedDetails.vehicle) {
          requestData.vehicle = customerDetails.monthlyFixedDetails.vehicle
        }
        if (monthlyFixedRequest.staffType === 'regular' && customerDetails.monthlyFixedDetails.staff) {
          requestData.staff = customerDetails.monthlyFixedDetails.staff
        }
      }

      try {
        if (isEditing) {
          await updateMonthlyFixedRequest.mutateAsync({ _id: requestId, ...requestData })
          setConfirmationPopUpType('update')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('Monthly Fixed Request updated successfully!')
        } else {
          await createMonthlyFixedRequest.mutateAsync(requestData)
          setConfirmationPopUpType('create')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('New Monthly Fixed Request created successfully!')
        }

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to submit monthly fixed request', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Error')
        setConfirmationPopUpSubtitle(`Unable to ${isEditing ? 'update' : 'create'} monthly fixed request. Please try again.`)
        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      }
    } else {
      console.log('Submit Monthly Fixed Request: Validation Error', errorMap)
    }
  }

  // Populate form with existing data if in edit mode
  React.useEffect(() => {
    if (isEditing && monthlyFixedRequestData) {
      const transformedData = transformMonthlyFixedRequestResponse(monthlyFixedRequestData)
      setMonthlyFixedRequest(transformedData)
    }
  }, [isEditing, monthlyFixedRequestData])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          {isEditing ? 'Edit Monthly Fixed Request' : 'New Monthly Fixed Request'}
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
              label: isEditing ? 'Edit Monthly Fixed Request' : 'New Monthly Fixed Request',
            },
          ]}
        />
      </div>
      {(apiErrors.vehicles || apiErrors.suppliers || apiErrors.staff || apiErrors.customers || apiErrors.supplierVehicles || apiErrors.supplierPackages || apiErrors.providerPackages || apiErrors.selectedCustomer || apiErrors.monthlyFixedRequest) && (
        <Alert
          type="error"
          message={`Some data could not be loaded: ${Object.values(apiErrors).filter(Boolean).join(' ')}`}
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      {isValidationError && (
        <Alert
          type="error"
          message="There is an error with submission, please correct errors indicated below."
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      {customerAlert && (
        <Alert
          type="error"
          message={customerAlert}
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
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
                <ConfiguredInput
                  label="Customer Category"
                  name="customerCategory"
                  configToUse="Customer category"
                  type={CONFIGURED_INPUT_TYPES.SELECT}
                  value={monthlyFixedRequest.customerCategory}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      customerCategory: value.customerCategory.toString(),
                      customer: '',
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['customerCategory']}
                  invalid={!!monthlyFixedRequestErrorMap['customerCategory']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Customer"
                  name="customer"
                  options={getSelectOptions(customersLoading, customersIsError, customerOptions, 'Please wait...', 'Unable to load options', 'No customers found')}
                  value={monthlyFixedRequest.customer ? ((customerOptions.find((option: any) => option.key === monthlyFixedRequest.customer) as any)?.value ?? '') : ''}
                  changeHandler={value => {
                    if (isPlaceholderValue(value.customer?.toString() || '', 'customers')) return

                    const selectedOption = customerOptions.find((option: any) => option.value === value.customer) as any
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      customer: selectedOption?.key ?? '',
                    })
                  }}
                  required
                  disabled={!monthlyFixedRequest.customerCategory || customersLoading || customersIsError}
                  errorMessage={monthlyFixedRequestErrorMap['customer']}
                  invalid={!!monthlyFixedRequestErrorMap['customer']}
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
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Vehicle Selection"
                  name="vehicleSelection"
                  options={[
                    { key: 'vehicle-selection-regular', value: 'regular' },
                    { key: 'vehicle-selection-own', value: 'own' },
                    { key: 'vehicle-selection-supplier', value: 'supplier' },
                    { key: 'vehicle-selection-new', value: 'new' },
                  ]}
                  value={monthlyFixedRequest.vehicleType}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      vehicleType: value.vehicleSelection,
                      vehicleCategory: ['own', 'supplier', 'new'].includes(value.vehicleSelection) ? monthlyFixedRequest.vehicleCategory : null,
                      vehicle: ['own', 'supplier', 'new'].includes(value.vehicleSelection) ? monthlyFixedRequest.vehicle : null,
                      supplier: value.vehicleSelection === 'supplier' ? monthlyFixedRequest.supplier : null,
                      supplierPackage: value.vehicleSelection === 'supplier' ? monthlyFixedRequest.supplierPackage : null,
                      vehicleDetails: value.vehicleSelection === 'new' ? {
                        ownerName: '',
                        ownerContact: '',
                        ownerEmail: '',
                        manufacturer: '',
                        name: '',
                        registrationNo: '',
                      } : null,
                    })
                  }}
                  direction="horizontal"
                  required
                  errorMessage={monthlyFixedRequestErrorMap['vehicleType']}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Staff Selection"
                  name="staffSelection"
                  options={[
                    { key: 'staff-selection-regular', value: 'regular' },
                    { key: 'staff-selection-own', value: 'own' },
                    { key: 'staff-selection-new', value: 'new' },
                  ]}
                  value={monthlyFixedRequest.staffType}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      staffType: value.staffSelection,
                      staffCategory: value.staffSelection === 'own' ? monthlyFixedRequest.staffCategory : null,
                      staff: value.staffSelection === 'own' ? monthlyFixedRequest.staff : null,
                      staffDetails: value.staffSelection === 'new' ? {
                        name: '',
                        contact: '',
                        license: '',
                      } : null,
                    })
                  }}
                  direction="horizontal"
                  required
                  errorMessage={monthlyFixedRequestErrorMap['staffType']}
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
                  value={monthlyFixedRequest.requestType}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestType: value.requestType?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['requestType']}
                  invalid={!!monthlyFixedRequestErrorMap['requestType']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Pickup Location"
                  name="pickupLocation"
                  value={monthlyFixedRequest.pickUpLocation}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      pickUpLocation: value.pickupLocation?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['pickUpLocation']}
                  invalid={!!monthlyFixedRequestErrorMap['pickUpLocation']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Drop Location"
                  name="dropOffLocation"
                  value={monthlyFixedRequest.dropOffLocation}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      dropOffLocation: value.dropOffLocation?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['dropOffLocation']}
                  invalid={!!monthlyFixedRequestErrorMap['dropOffLocation']}
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
                  value={monthlyFixedRequest.pickUpDateTime ? formatDateTimeForInput(monthlyFixedRequest.pickUpDateTime) : ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      pickUpDateTime: value.pickupDateAndTime ? parseDateTimeFromInput(value.pickupDateAndTime.toString()) : null,
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['pickUpDateTime']}
                  invalid={!!monthlyFixedRequestErrorMap['pickUpDateTime']}
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
                  value={monthlyFixedRequest.dropDateTime ? formatDateTimeForInput(monthlyFixedRequest.dropDateTime) : ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      dropDateTime: value.dropDateAndTime ? parseDateTimeFromInput(value.dropDateAndTime.toString()) : null,
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['dropDateTime']}
                  invalid={!!monthlyFixedRequestErrorMap['dropDateTime']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'read-only'])}
              >
                <ReadOnlyText
                  label="Duration"
                  value={monthlyFixedRequest.totalHr ? formatMinutesToDuration(monthlyFixedRequest.totalHr) : '-'}
                  color="success"
                  size="jumbo"
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
                  value={monthlyFixedRequest.openingKm ?? ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      openingKm: value.openingKm ? Number(value.openingKm) : null,
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['openingKm']}
                  invalid={!!monthlyFixedRequestErrorMap['openingKm']}
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
                  value={monthlyFixedRequest.closingKm ?? ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      closingKm: value.closingKm ? Number(value.closingKm) : null,
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['closingKm']}
                  invalid={!!monthlyFixedRequestErrorMap['closingKm']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'read-only'])}
              >
                <ReadOnlyText
                  label="Total Distance"
                  value={monthlyFixedRequest.totalKm ? `${monthlyFixedRequest.totalKm} km` : '-'}
                  color="success"
                  size="jumbo"
                />
              </Column>
            </Row>
          </Panel>

          {/* Vehicle Details Panel - Only shown when vehicle selection is 'own', 'supplier', or 'new' */}
          {['own', 'supplier', 'new'].includes(monthlyFixedRequest.vehicleType) && (
            <Panel
              title="Vehicle Details"
              className={bemClass([blk, 'margin-bottom'])}
            >
              {monthlyFixedRequest.vehicleType === 'supplier' ? (
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Supplier"
                      name="supplier"
                      options={getSelectOptions(suppliersLoading, suppliersIsError, supplierOptions, 'Please wait...', 'Unable to load options', 'No suppliers found')}
                      value={monthlyFixedRequest.supplier ? ((supplierOptions.find((option: any) => option.key === monthlyFixedRequest.supplier) as any)?.value ?? '') : ''}
                      changeHandler={value => {
                        if (isPlaceholderValue(value.supplier?.toString() || '', 'suppliers')) return
                        const selectedOption = supplierOptions.find((option: any) => option.value === value.supplier) as any
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          supplier: selectedOption?.key ?? '',
                          supplierPackage: null,
                          vehicle: null,
                        })
                      }}
                      required
                      disabled={suppliersLoading || suppliersIsError}
                      errorMessage={monthlyFixedRequestErrorMap['supplier']}
                      invalid={!!monthlyFixedRequestErrorMap['supplier']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Vehicle"
                      name="vehicle"
                      options={getSelectOptions(
                        supplierVehiclesLoading,
                        supplierVehiclesIsError,
                        monthlyFixedRequest.supplier
                          ? supplierVehicleOptions.filter((option: any) => {
                              const vehicle = supplierVehicles?.data?.find((v: any) => v._id === option.key)
                              return vehicle?.supplier === monthlyFixedRequest.supplier
                            })
                          : [],
                        'Please wait...',
                        'Unable to load options',
                        'No vehicles found',
                      )}
                      value={monthlyFixedRequest.vehicle ? ((supplierVehicleOptions.find((option: any) => option.key === monthlyFixedRequest.vehicle) as any)?.value ?? '') : ''}
                      changeHandler={value => {
                        if (isPlaceholderValue(value.vehicle?.toString() || '', 'supplierVehicles')) return

                        const selectedOption = supplierVehicleOptions.find((option: any) => option.value === value.vehicle) as any
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          vehicle: selectedOption?.key ?? '',
                        })
                      }}
                      required
                      disabled={!monthlyFixedRequest.supplier || supplierVehiclesLoading || supplierVehiclesIsError}
                      errorMessage={monthlyFixedRequestErrorMap['vehicle']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicle']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Package"
                      name="supplierPackage"
                      options={getSelectOptions(
                        supplierPackagesLoading,
                        supplierPackagesIsError,
                        monthlyFixedRequest.supplier
                          ? supplierPackageOptions.filter((option: any) => {
                              const pkg = supplierPackages?.data?.find((p: any) => p._id === option.key)
                              return pkg?.supplier === monthlyFixedRequest.supplier
                            })
                          : [],
                        'Please wait...',
                        'Unable to load options',
                        'No packages found',
                      )}
                      value={
                        monthlyFixedRequest.supplierPackage
                          ? ((supplierPackageOptions.find((option: any) => option.key === monthlyFixedRequest.supplierPackage) as any)?.value ?? '')
                          : ''
                      }
                      changeHandler={value => {
                        if (isPlaceholderValue(value.supplierPackage?.toString() || '', 'supplierPackages')) return

                        const selectedOption = supplierPackageOptions.find((option: any) => option.value === value.supplierPackage) as any
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          supplierPackage: selectedOption?.key ?? '',
                        })
                      }}
                      required
                      disabled={!monthlyFixedRequest.supplier || supplierPackagesLoading || supplierPackagesIsError}
                      errorMessage={monthlyFixedRequestErrorMap['supplierPackage']}
                      invalid={!!monthlyFixedRequestErrorMap['supplierPackage']}
                    />
                  </Column>
                </Row>
              ) : monthlyFixedRequest.vehicleType === 'new' ? (
                <>
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Owner Name"
                        name="ownerName"
                        value={monthlyFixedRequest.vehicleDetails?.ownerName ?? ''}
                        changeHandler={value => {
                          setMonthlyFixedRequest({
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails!,
                              ownerName: value.ownerName?.toString() || '',
                            },
                          })
                        }}
                        required
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.ownerName']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.ownerName']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Owner Contact"
                        name="ownerContact"
                        value={monthlyFixedRequest.vehicleDetails?.ownerContact ?? ''}
                        changeHandler={value => {
                          setMonthlyFixedRequest({
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails!,
                              ownerContact: value.ownerContact?.toString() || '',
                            },
                          })
                        }}
                        required
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.ownerContact']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.ownerContact']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Owner Email"
                        name="ownerEmail"
                        type="email"
                        value={monthlyFixedRequest.vehicleDetails?.ownerEmail ?? ''}
                        changeHandler={value => {
                          setMonthlyFixedRequest({
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails!,
                              ownerEmail: value.ownerEmail?.toString() || '',
                            },
                          })
                        }}
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.ownerEmail']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.ownerEmail']}
                      />
                    </Column>
                  </Row>
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Manufacturer"
                        name="manufacturer"
                        value={monthlyFixedRequest.vehicleDetails?.manufacturer ?? ''}
                        changeHandler={value => {
                          setMonthlyFixedRequest({
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails!,
                              manufacturer: value.manufacturer?.toString() || '',
                            },
                          })
                        }}
                        required
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.manufacturer']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.manufacturer']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Vehicle Name"
                        name="vehicleName"
                        value={monthlyFixedRequest.vehicleDetails?.name ?? ''}
                        changeHandler={value => {
                          setMonthlyFixedRequest({
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails!,
                              name: value.vehicleName?.toString() || '',
                            },
                          })
                        }}
                        required
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.name']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.name']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Registration Number"
                        name="registrationNo"
                        value={monthlyFixedRequest.vehicleDetails?.registrationNo ?? ''}
                        changeHandler={value => {
                          setMonthlyFixedRequest({
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails!,
                              registrationNo: value.registrationNo?.toString() || '',
                            },
                          })
                        }}
                        required
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.registrationNo']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.registrationNo']}
                      />
                    </Column>
                  </Row>
                </>
              ) : (
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <ConfiguredInput
                      label="Vehicle Category"
                      name="vehicleCategory"
                      configToUse="Vehicle category"
                      type={CONFIGURED_INPUT_TYPES.SELECT}
                      value={monthlyFixedRequest.vehicleCategory || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          vehicleCategory: value.vehicleCategory?.toString() ?? '',
                          vehicle: null,
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['vehicleCategory']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicleCategory']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Vehicle"
                      name="vehicle"
                      options={getSelectOptions(vehiclesLoading, vehiclesIsError, vehicleOptions, 'Please wait...', 'Unable to load options', 'No vehicles found')}
                      value={monthlyFixedRequest.vehicle ? ((vehicleOptions.find((option: any) => option.key === monthlyFixedRequest.vehicle) as any)?.value ?? '') : ''}
                      changeHandler={value => {
                        if (isPlaceholderValue(value.vehicle?.toString() || '', 'vehicles')) return

                        const selectedOption = vehicleOptions.find((option: any) => option.value === value.vehicle) as any
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          vehicle: selectedOption?.key ?? '',
                        })
                      }}
                      required
                      disabled={!monthlyFixedRequest.vehicleCategory || vehiclesLoading || vehiclesIsError}
                      errorMessage={monthlyFixedRequestErrorMap['vehicle']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicle']}
                    />
                  </Column>
                </Row>
              )}
            </Panel>
          )}

          {/* Provider Package Details Panel - Only shown when vehicle selection is 'new' */}
          {monthlyFixedRequest.vehicleType === 'new' && (
            <Panel
              title="Provider Package Details"
              className={bemClass([blk, 'margin-bottom'])}
            >
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <ConfiguredInput
                    label="Package Category"
                    name="providerPackageCategory"
                    configToUse="Package category"
                    type={CONFIGURED_INPUT_TYPES.SELECT}
                    value={monthlyFixedRequest.packageFromProvidedVehicle?.packageCategory || ''}
                    changeHandler={value => {
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        packageFromProvidedVehicle: {
                          packageCategory: value.providerPackageCategory?.toString() ?? '',
                          packageId: monthlyFixedRequest.packageFromProvidedVehicle?.packageId ?? '',
                        },
                      })
                    }}
                    required
                    errorMessage={monthlyFixedRequestErrorMap['packageFromProvidedVehicle.packageCategory']}
                    invalid={!!monthlyFixedRequestErrorMap['packageFromProvidedVehicle.packageCategory']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Package"
                    name="providerPackage"
                    options={getSelectOptions(providerPackagesLoading, providerPackagesIsError, providerPackageOptions, 'Please wait...', 'Unable to load options', 'No provider packages found')}
                    value={monthlyFixedRequest.packageFromProvidedVehicle?.packageId ? ((providerPackageOptions.find((option: any) => option.key === monthlyFixedRequest.packageFromProvidedVehicle?.packageId) as any)?.value ?? '') : ''}
                    changeHandler={value => {
                      if (isPlaceholderValue(value.providerPackage?.toString() || '', 'providerPackages')) return

                      const selectedOption = providerPackageOptions.find((option: any) => option.value === value.providerPackage) as any
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        packageFromProvidedVehicle: {
                          packageCategory: monthlyFixedRequest.packageFromProvidedVehicle?.packageCategory ?? '',
                          packageId: selectedOption?.key ?? '',
                        },
                      })
                    }}
                    required
                    disabled={!monthlyFixedRequest.packageFromProvidedVehicle?.packageCategory || providerPackagesLoading || providerPackagesIsError}
                    errorMessage={monthlyFixedRequestErrorMap['packageFromProvidedVehicle.packageId']}
                    invalid={!!monthlyFixedRequestErrorMap['packageFromProvidedVehicle.packageId']}
                  />
                </Column>
              </Row>
            </Panel>
          )}

          {/* Staff Details Panel - Only shown when staff selection is 'own' or 'new' */}
          {['own', 'new'].includes(monthlyFixedRequest.staffType) && (
            <Panel
              title="Staff Details"
              className={bemClass([blk, 'margin-bottom'])}
            >
              {monthlyFixedRequest.staffType === 'new' ? (
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Staff Name"
                      name="staffName"
                      value={monthlyFixedRequest.staffDetails?.name ?? ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          staffDetails: {
                            ...monthlyFixedRequest.staffDetails!,
                            name: value.staffName?.toString() || '',
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['staffDetails.name']}
                      invalid={!!monthlyFixedRequestErrorMap['staffDetails.name']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Staff Contact"
                      name="staffContact"
                      value={monthlyFixedRequest.staffDetails?.contact ?? ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          staffDetails: {
                            ...monthlyFixedRequest.staffDetails!,
                            contact: value.staffContact?.toString() || '',
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['staffDetails.contact']}
                      invalid={!!monthlyFixedRequestErrorMap['staffDetails.contact']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Staff License"
                      name="staffLicense"
                      value={monthlyFixedRequest.staffDetails?.license ?? ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          staffDetails: {
                            ...monthlyFixedRequest.staffDetails!,
                            license: value.staffLicense?.toString() || '',
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['staffDetails.license']}
                      invalid={!!monthlyFixedRequestErrorMap['staffDetails.license']}
                    />
                  </Column>
                </Row>
              ) : (
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
                      value={monthlyFixedRequest.staffCategory || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          staffCategory: value.staffCategory?.toString() ?? '',
                          staff: null,
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['staffCategory']}
                      invalid={!!monthlyFixedRequestErrorMap['staffCategory']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Staff"
                      name="staff"
                      options={getSelectOptions(staffLoading, staffIsError, staffOptions, 'Please wait...', 'Unable to load options', 'No staff found')}
                      value={monthlyFixedRequest.staff ? ((staffOptions.find((option: any) => option.key === monthlyFixedRequest.staff) as any)?.value ?? '') : ''}
                      changeHandler={value => {
                        if (isPlaceholderValue(value.staff?.toString() || '', 'staff')) return

                        const selectedOption = staffOptions.find((option: any) => option.value === value.staff) as any
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          staff: selectedOption?.key ?? '',
                        })
                      }}
                      required
                      disabled={!monthlyFixedRequest.staffCategory || staffLoading || staffIsError}
                      errorMessage={monthlyFixedRequestErrorMap['staff']}
                      invalid={!!monthlyFixedRequestErrorMap['staff']}
                    />
                  </Column>
                </Row>
              )}
            </Panel>
          )}

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
                    checked={monthlyFixedRequest.otherCharges.toll.isChargeableToCustomer}
                    changeHandler={value => {
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        otherCharges: {
                          ...monthlyFixedRequest.otherCharges,
                          toll: {
                            ...monthlyFixedRequest.otherCharges.toll,
                            isChargeableToCustomer: value.tollChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="toll"
                  placeholder="Toll"
                  value={monthlyFixedRequest.otherCharges.toll.amount}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        toll: {
                          ...monthlyFixedRequest.otherCharges.toll,
                          amount: value.toll ? Number(value.toll) : 0,
                        },
                      },
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['otherCharges.toll.amount']}
                  invalid={!!monthlyFixedRequestErrorMap['otherCharges.toll.amount']}
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
                    checked={monthlyFixedRequest.otherCharges.parking.isChargeableToCustomer}
                    changeHandler={value => {
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        otherCharges: {
                          ...monthlyFixedRequest.otherCharges,
                          parking: {
                            ...monthlyFixedRequest.otherCharges.parking,
                            isChargeableToCustomer: value.parkingChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="parking"
                  placeholder="Parking"
                  value={monthlyFixedRequest.otherCharges.parking.amount}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        parking: {
                          ...monthlyFixedRequest.otherCharges.parking,
                          amount: value.parking ? Number(value.parking) : 0,
                        },
                      },
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['otherCharges.parking.amount']}
                  invalid={!!monthlyFixedRequestErrorMap['otherCharges.parking.amount']}
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
                    checked={monthlyFixedRequest.otherCharges.nightHalt.isChargeableToCustomer}
                    changeHandler={value => {
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        otherCharges: {
                          ...monthlyFixedRequest.otherCharges,
                          nightHalt: {
                            ...monthlyFixedRequest.otherCharges.nightHalt,
                            isChargeableToCustomer: value.nightHaltChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="nightHalt"
                  placeholder="Night Halt"
                  value={monthlyFixedRequest.otherCharges.nightHalt.amount}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        nightHalt: {
                          ...monthlyFixedRequest.otherCharges.nightHalt,
                          amount: value.nightHalt ? Number(value.nightHalt) : 0,
                        },
                      },
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['otherCharges.nightHalt.amount']}
                  invalid={!!monthlyFixedRequestErrorMap['otherCharges.nightHalt.amount']}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Include Night Halt in driver salary?"
                  name="includeNightHaltInDriverSalary"
                  options={[
                    { key: 'include-night-halt-yes', value: 'Yes' },
                    { key: 'include-night-halt-no', value: 'No' },
                  ]}
                  value={monthlyFixedRequest.otherCharges.nightHalt.isPayableWithSalary ? 'Yes' : 'No'}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        nightHalt: {
                          ...monthlyFixedRequest.otherCharges.nightHalt,
                          isPayableWithSalary: value.includeNightHaltInDriverSalary === 'Yes',
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
                    checked={monthlyFixedRequest.otherCharges.driverAllowance.isChargeableToCustomer}
                    changeHandler={value => {
                      setMonthlyFixedRequest({
                        ...monthlyFixedRequest,
                        otherCharges: {
                          ...monthlyFixedRequest.otherCharges,
                          driverAllowance: {
                            ...monthlyFixedRequest.otherCharges.driverAllowance,
                            isChargeableToCustomer: value.driverAllowanceChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="driverAllowance"
                  placeholder="Driver Allowance"
                  value={monthlyFixedRequest.otherCharges.driverAllowance.amount}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        driverAllowance: {
                          ...monthlyFixedRequest.otherCharges.driverAllowance,
                          amount: value.driverAllowance ? Number(value.driverAllowance) : 0,
                        },
                      },
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['otherCharges.driverAllowance.amount']}
                  invalid={!!monthlyFixedRequestErrorMap['otherCharges.driverAllowance.amount']}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Include Driver Allowance in driver salary?"
                  name="includeDriverAllowanceInDriverSalary"
                  options={[
                    { key: 'include-driver-allowance-yes', value: 'Yes' },
                    { key: 'include-driver-allowance-no', value: 'No' },
                  ]}
                  value={monthlyFixedRequest.otherCharges.driverAllowance.isPayableWithSalary ? 'Yes' : 'No'}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        driverAllowance: {
                          ...monthlyFixedRequest.otherCharges.driverAllowance,
                          isPayableWithSalary: value.includeDriverAllowanceInDriverSalary === 'Yes',
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
                  value={monthlyFixedRequest.advancePayment.advancedFromCustomer}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      advancePayment: {
                        ...monthlyFixedRequest.advancePayment,
                        advancedFromCustomer: value.advanceFromCustomer ? Number(value.advanceFromCustomer) : 0,
                      },
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['advancePayment.advancedFromCustomer']}
                  invalid={!!monthlyFixedRequestErrorMap['advancePayment.advancedFromCustomer']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Advance to Driver"
                  name="advanceToDriver"
                  value={monthlyFixedRequest.advancePayment.advancedToDriver}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      advancePayment: {
                        ...monthlyFixedRequest.advancePayment,
                        advancedToDriver: value.advanceToDriver ? Number(value.advanceToDriver) : 0,
                      },
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['advancePayment.advancedToDriver']}
                  invalid={!!monthlyFixedRequestErrorMap['advancePayment.advancedToDriver']}
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
              value={monthlyFixedRequest.comment}
              changeHandler={value => {
                setMonthlyFixedRequest({
                  ...monthlyFixedRequest,
                  comment: value.comment?.toString() ?? '',
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
            clickHandler={submitHandler}
          >
            {isEditing ? 'Update' : 'Submit'}
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

export default CreateMonthlyFixedRequest
