import { Breadcrumb, Text, Panel, Row, Column, TextInput, SelectInput, RadioGroup, CheckBox, TextArea, Button, Alert, Modal, ConfirmationPopup, Toggle, ReadOnlyText } from '@base'
import { PackageModel, RegularRequestModel } from '@types'
import { bemClass, validatePayload, nameToPath, formatDateTimeForInput, parseDateTimeFromInput } from '@utils'
import React, { FunctionComponent, useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { calculateTotalValidationSchema, createValidationSchema } from './validation'
import { useCreateRegularRequestMutation, useUpdateRegularRequestMutation, useRegularRequestByIdQuery } from '@api/queries/regular-request'
import { useCustomerByCategory } from '@api/queries/customer'
import { useVehicleByCategory } from '@api/queries/vehicle'
import { useStaffByCategory } from '@api/queries/staff'
import { usePackageByCategory } from '@api/queries/package'
import { useSuppliersQuery } from '@api/queries/supplier'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

import './style.scss'

const blk = 'create-regular-request'

interface CreateRegularRequestProps {}

const extractIdFromResponse = (field: any): string => {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object' && field._id) return field._id
  return ''
}

const transformRegularRequestResponse = (response: any): RegularRequestModel => {
  const vehicleType = response.vehicleType || 'existing'
  const vehicleCategory = response.vehicleCategory || null
  const isSupplierVehicle = vehicleType === 'existing' && vehicleCategory && nameToPath(vehicleCategory) === 'supplier'

  return {
  customerType: response.customerType || 'existing',
  vehicleType,
  staffType: response.staffType || 'existing',
  requestType: response.requestType || '',

  customerCategory: response.customerCategory || null,
  customer: extractIdFromResponse(response.customer),
  customerDetails: response.customerDetails || null,
  vehicleCategory,
  supplier: isSupplierVehicle ? extractIdFromResponse(response.supplier) : null,
  vehicle: extractIdFromResponse(response.vehicle),
  vehicleDetails: response.vehicleDetails || null,
  packageFromProvidedVehicle: response.packageFromProvidedVehicle || undefined,
  ac: response.ac || false,
  packageCategory: response.packageCategory || null,
  supplierPackage: isSupplierVehicle ? extractIdFromResponse(response.supplierPackage) : null,
  package: extractIdFromResponse(response.package),
  staffCategory: response.staffCategory || null,
  staff: extractIdFromResponse(response.staff),
  staffDetails: response.staffDetails || null,
  pickUpLocation: response.pickUpLocation || '',
  dropOffLocation: response.dropOffLocation || '',
  pickUpDateTime: response.pickUpDateTime ? new Date(response.pickUpDateTime) : null,
  dropDateTime: response.dropDateTime ? new Date(response.dropDateTime) : null,
  openingKm: response.openingKm || null,
  closingKm: response.closingKm || null,
  totalKm: response.totalKm || null,
  totalHr: response.totalHr || null,

  paymentDetails: {
    status: response.paymentDetails?.status || '',
    paymentMethod: response.paymentDetails?.paymentMethod || '',
    paymentDate: response.paymentDetails?.paymentDate ? new Date(response.paymentDetails.paymentDate) : null,
  },
  otherCharges: {
    toll: {
      amount: response.otherCharges?.toll?.amount || '',
      isChargeableToCustomer: response.otherCharges?.toll?.isChargeableToCustomer || false,
    },
    parking: {
      amount: response.otherCharges?.parking?.amount || '',
      isChargeableToCustomer: response.otherCharges?.parking?.isChargeableToCustomer || false,
    },
    nightHalt: {
      amount: response.otherCharges?.nightHalt?.amount || '',
      isChargeableToCustomer: response.otherCharges?.nightHalt?.isChargeableToCustomer || false,
      isPayableWithSalary: response.otherCharges?.nightHalt?.isPayableWithSalary || false,
    },
    driverAllowance: {
      amount: response.otherCharges?.driverAllowance?.amount || '',
      isChargeableToCustomer: response.otherCharges?.driverAllowance?.isChargeableToCustomer || false,
      isPayableWithSalary: response.otherCharges?.driverAllowance?.isPayableWithSalary || false,
    },
  },
  advancedPayment: {
    advancedFromCustomer: response.advancedPayment?.advancedFromCustomer || '',
    advancedToSupplier: response.advancedPayment?.advancedToSupplier || '',
  },
  requestTotal: response.requestTotal || 0,
  providedVehiclePayment: response.providedVehiclePayment || 0,
  requestExpense: response.requestExpense || 0,
  requestProfit: response.requestProfit || 0,
  customerBill: response.customerBill || 0,
  comment: response.comment || '',
}}

const CreateRegularRequest: FunctionComponent<CreateRegularRequestProps> = () => {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const requestId = id || ''

  const { data: regularRequestData, isLoading: isLoadingRequest } = useRegularRequestByIdQuery(requestId)

  const updateRegularRequestMutation = useUpdateRegularRequestMutation()

  // Load data when in edit mode
  useEffect(() => {
    if (isEditing && regularRequestData) {
      const transformedData = transformRegularRequestResponse(regularRequestData)
      setRegularRequest(transformedData)
    }
  }, [isEditing, regularRequestData])

  // Helper functions for calculations
  const calculateDateTimeDifference = (startDate: Date | null, endDate: Date | null): string => {
    if (!startDate || !endDate) return ''

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end <= start) return ''

    const diffMs = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays === 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
    } else if (diffHours === 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}, ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
    }
  }

  const calculateKmDifference = (openingKm: number | null, closingKm: number | null): string => {
    if (!openingKm || !closingKm) return ''

    if (closingKm <= openingKm) return ''

    const diffKm = closingKm - openingKm
    return `${diffKm} km${diffKm !== 1 ? 's' : ''}`
  }

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

  const sampleRegularRequestModel: RegularRequestModel = {
    customerType: 'existing',
    vehicleType: 'existing',
    staffType: 'existing',
    requestType: '',

    customerCategory: null,
    customer: null,
    customerDetails: null,
    vehicleCategory: null,
    supplier: null,
    vehicle: null,
    vehicleDetails: null,
    packageFromProvidedVehicle: undefined,
    ac: false,
    packageCategory: null,
    supplierPackage: null,
    package: null,
    staffCategory: null,
    staff: null,
    staffDetails: null,
    pickUpLocation: '',
    dropOffLocation: '',
    pickUpDateTime: null,
    dropDateTime: null,
    openingKm: null,
    closingKm: null,
    totalKm: null,
    totalHr: null,

    paymentDetails: {
      status: '',
      paymentMethod: '',
      paymentDate: null,
    },
    otherCharges: {
      toll: {
        amount: '',
        isChargeableToCustomer: false,
      },
      parking: {
        amount: '',
        isChargeableToCustomer: false,
      },
      nightHalt: {
        amount: '',
        isChargeableToCustomer: false,
        isPayableWithSalary: false,
      },
      driverAllowance: {
        amount: '',
        isChargeableToCustomer: false,
        isPayableWithSalary: false,
      },
    },
    advancedPayment: {
      advancedFromCustomer: '',
      advancedToSupplier: '',
    },
    requestTotal: 0,
    providedVehiclePayment: 0,
    requestExpense: 0,
    requestProfit: 0,
    customerBill: 0,
    comment: '',
  }

  const navigate = useNavigate()
  const createRegularRequest = useCreateRegularRequestMutation()

  const [regularRequest, setRegularRequest] = useState<RegularRequestModel>(sampleRegularRequestModel)

  // Category paths for API queries
  const customerCategoryPath = useMemo(() => {
    return regularRequest.customerType === 'existing' && regularRequest.customerCategory ? nameToPath(regularRequest.customerCategory) : ''
  }, [regularRequest.customerType, regularRequest.customerCategory])

  const vehicleCategoryPath = useMemo(() => {
    return regularRequest.vehicleType === 'existing' && regularRequest.vehicleCategory ? nameToPath(regularRequest.vehicleCategory) : ''
  }, [regularRequest.vehicleType, regularRequest.vehicleCategory])

  const staffCategoryPath = useMemo(() => {
    return regularRequest.staffType === 'existing' && regularRequest.staffCategory ? nameToPath(regularRequest.staffCategory) : ''
  }, [regularRequest.staffType, regularRequest.staffCategory])

  const packageCategoryPath = useMemo(() => {
    return regularRequest.packageCategory ? nameToPath(regularRequest.packageCategory) : ''
  }, [regularRequest.packageCategory])

  const providerPackageCategoryPath = useMemo(() => {
    return regularRequest.packageFromProvidedVehicle?.packageCategory ? nameToPath(regularRequest.packageFromProvidedVehicle.packageCategory) : ''
  }, [regularRequest.packageFromProvidedVehicle?.packageCategory])

  // API queries
  const { data: customers, error: customersError, isLoading: customersLoading, isError: customersIsError } = useCustomerByCategory(customerCategoryPath)

  const { data: vehicles, error: vehiclesError, isLoading: vehiclesLoading, isError: vehiclesIsError } = useVehicleByCategory(vehicleCategoryPath)

  const { data: suppliers, error: suppliersError, isLoading: suppliersLoading, isError: suppliersIsError } = useSuppliersQuery()

  const { data: staffMembers, error: staffError, isLoading: staffLoading, isError: staffIsError } = useStaffByCategory(staffCategoryPath)

  const { data: packages, error: packagesError, isLoading: packagesLoading, isError: packagesIsError } = usePackageByCategory(packageCategoryPath)

  const { data: providerPackages, error: providerPackagesError, isLoading: providerPackagesLoading, isError: providerPackagesIsError } = usePackageByCategory(providerPackageCategoryPath)

  const { data: supplierPackages, error: supplierPackagesError, isLoading: supplierPackagesLoading, isError: supplierPackagesIsError } = usePackageByCategory('supplier')

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New regular request created successfully!')

  const [customerOptions, setCustomerOptions] = useState<{ key: any; value: any }[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<{ key: any; value: any }[]>([])
  const [supplierOptions, setSupplierOptions] = useState<{ key: any; value: any }[]>([])
  const [staffOptions, setStaffOptions] = useState<{ key: any; value: any }[]>([])
  const [packageOptions, setPackageOptions] = useState<{ key: any; value: any }[]>([])
  const [providerPackageOptions, setProviderPackageOptions] = useState<{ key: any; value: any }[]>([])
  const [supplierPackageOptions, setSupplierPackageOptions] = useState<{ key: any; value: any }[]>([])

  // API Error states
  const [apiErrors, setApiErrors] = useState({
    customers: '',
    vehicles: '',
    suppliers: '',
    staff: '',
    packages: '',
    providerPackages: '',
    supplierPackages: '',
  })

  // Generic function to handle API responses and errors
  const handleApiResponse = (
    data: any,
    error: any,
    isError: boolean,
    errorKey: 'customers' | 'vehicles' | 'suppliers' | 'staff' | 'packages' | 'providerPackages' | 'supplierPackages',
    setOptions: React.Dispatch<React.SetStateAction<{ key: any; value: any }[]>>,
    mapFunction: (item: any) => { key: any; value: any },
  ) => {
    if (isError) {
      const userFriendlyMessages = {
        customers: 'Unable to load customer data. Please check your connection and try again.',
        vehicles: 'Unable to load vehicle data. Please check your connection and try again.',
        suppliers: 'Unable to load supplier data. Please check your connection and try again.',
        staff: 'Unable to load staff data. Please check your connection and try again.',
        packages: 'Unable to load package information. Please check your connection and try again.',
        providerPackages: 'Unable to load provider package information. Please check your connection and try again.',
        supplierPackages: 'Unable to load supplier package information. Please check your connection and try again.',
      }
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: userFriendlyMessages[errorKey],
      }))
      setOptions([])
    } else if (data?.data?.length > 0) {
      const options = data.data.map(mapFunction)
      setOptions(options)
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: '',
      }))
    } else {
      setOptions([])
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: '',
      }))
    }
  }

  // Profit Calculation

  const calculateOtherChargesExpenses = () => {
    const { toll, parking, nightHalt, driverAllowance } = regularRequest.otherCharges
    const tollAmount = toll.isChargeableToCustomer ? 0 : Number(toll.amount)
    const parkingAmount = parking.isChargeableToCustomer ? 0 : Number(parking.amount)
    const nightHaltAmount = nightHalt.isChargeableToCustomer ? 0 : Number(nightHalt.amount)
    const driverAllowanceAmount = driverAllowance.isChargeableToCustomer ? 0 : Number(driverAllowance.amount)
    return Number(tollAmount) + Number(parkingAmount) + Number(nightHaltAmount) + Number(driverAllowanceAmount)
  }
  //
  const calculateOtherChargesForCustomer = () => {
    const { toll, parking, nightHalt, driverAllowance } = regularRequest.otherCharges
    const tollAmount = toll.isChargeableToCustomer ? Number(toll.amount) : 0
    const parkingAmount = parking.isChargeableToCustomer ? Number(parking.amount) : 0
    const nightHaltAmount = nightHalt.isChargeableToCustomer ? Number(nightHalt.amount) : 0
    const driverAllowanceAmount = driverAllowance.isChargeableToCustomer ? Number(driverAllowance.amount) : 0
    return tollAmount + parkingAmount + nightHaltAmount + driverAllowanceAmount
  }
  //
  const requestTotal = (packageDetail: PackageModel, totalKm: number = 0, totalHr: number = 0) => {
    const { baseAmount, minimumKm, extraKmPerKmRate, minimumHr, extraHrPerHrRate } = packageDetail
    const extraKm = (totalKm - Number(minimumKm)) < 0 ? 0 : totalKm - Number(minimumKm)
    const extraHr = (totalHr - Number(minimumHr)) < 0 ? 0 : totalHr - Number(minimumHr)
    const extraKmBilling = extraKm * Number(extraKmPerKmRate)
    const extraHrBilling = extraHr * Number(extraHrPerHrRate)
    return Number(baseAmount) + extraKmBilling + extraHrBilling
  }
  //
  const performCalculation = () => {
    const { vehicleType, vehicleCategory, package: customerPackageId, packageFromProvidedVehicle, supplierPackage: supplierPackageId, openingKm, closingKm, pickUpDateTime, dropDateTime } = regularRequest

    // Calculate total distance and time
    const totalKm = closingKm && openingKm ? closingKm - openingKm : 0
    const totalHr = pickUpDateTime && dropDateTime ? (new Date(dropDateTime).getTime() - new Date(pickUpDateTime).getTime()) / (1000 * 60) : 0
    // The packages are _id strings, so we need to find the full package details from the respective query data
    const customerPackage = packages?.data?.find((p: PackageModel) => p._id === customerPackageId)
    let providedVehiclePackage: PackageModel | undefined

    if (vehicleType === 'new' && packageFromProvidedVehicle?.package) {
      providedVehiclePackage = providerPackages?.data?.find((p: PackageModel) => p._id === packageFromProvidedVehicle.package)
    } else if (vehicleType === 'existing' && vehicleCategory && nameToPath(vehicleCategory) === 'supplier' && supplierPackageId) {
      providedVehiclePackage = supplierPackages?.data?.find((p: PackageModel) => p._id === supplierPackageId)
    }

    if (!customerPackage) {
      console.error('Customer package not found')
      return
    }

    const customerTotal = requestTotal(customerPackage, totalKm, totalHr)
    const providedVehicleTotal = providedVehiclePackage ? requestTotal(providedVehiclePackage, totalKm, totalHr) : 0
    // Calculate other charges
    const otherChargesExpense = calculateOtherChargesExpenses()
    const otherChargesForCustomer = calculateOtherChargesForCustomer()
    const profit = customerTotal - providedVehicleTotal - otherChargesExpense
    console.log('Profit Calculation:', { customerTotal, providedVehicleTotal, otherChargesExpense, profit, otherChargesForCustomer })
    setRegularRequest(prev => ({
      ...prev,
      totalKm,
      totalHr,
      requestTotal: customerTotal,
      providedVehiclePayment: providedVehicleTotal,
      requestExpense: otherChargesExpense,
      requestProfit: profit,
      customerBill: customerTotal + otherChargesForCustomer,
    }))
  }

  const calculateProfit = () => {
    //
    const { isValid, errorMap } = validatePayload(calculateTotalValidationSchema(regularRequest), regularRequest)
    setRegularRequestErrorMap({ ...regularRequestErrorMap, ...errorMap })
    setIsValidationError(!isValid)
    if (!isValid) {
      return
    }
    performCalculation()
  }

  // Generate options for SelectInput based on loading/error states
  const getSelectOptions = (isLoading: boolean, isError: boolean, options: { key: any; value: any }[], loadingText: string, errorText: string, noDataText: string) => {
    if (isLoading) return [{ key: 'loading', value: loadingText }]
    if (isError) return [{ key: 'error', value: errorText }]
    if (options.length > 0) return options
    return [{ key: 'no-data', value: noDataText }]
  }

  // Check if a value should be ignored in change handlers
  const isPlaceholderValue = (value: string, type: 'customers' | 'vehicles' | 'suppliers' | 'staff' | 'packages' | 'providerPackages' | 'supplierPackages') => {
    const placeholders = {
      customers: ['Please wait...', 'Unable to load options', 'No customers found'],
      vehicles: ['Please wait...', 'Unable to load options', 'No vehicles found'],
      suppliers: ['Please wait...', 'Unable to load options', 'No suppliers found'],
      staff: ['Please wait...', 'Unable to load options', 'No staff found'],
      packages: ['Please wait...', 'Unable to load options', 'No packages found'],
      providerPackages: ['Please wait...', 'Unable to load options', 'No provider packages found'],
      supplierPackages: ['Please wait...', 'Unable to load options', 'No supplier packages found'],
    }
    return placeholders[type].includes(value)
  }

  const [regularRequestErrorMap, setRegularRequestErrorMap] = useState<Record<string, any>>({})
  const [isValidationError, setIsValidationError] = useState(false)

  // useEffect hooks to handle API responses
  React.useEffect(() => {
    handleApiResponse(customers, customersError, customersIsError, 'customers', setCustomerOptions, (customer: { _id: any; name: any }) => ({
      key: customer._id,
      value: customer.name,
    }))
  }, [customers, customersError, customersIsError])

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
    handleApiResponse(packages, packagesError, packagesIsError, 'packages', setPackageOptions, (pkg: { _id: any; packageCode: any }) => ({ key: pkg._id, value: pkg.packageCode }))
  }, [packages, packagesError, packagesIsError])

  React.useEffect(() => {
    handleApiResponse(providerPackages, providerPackagesError, providerPackagesIsError, 'providerPackages', setProviderPackageOptions, (pkg: { _id: any; packageCode: any }) => ({ key: pkg._id, value: pkg.packageCode }))
  }, [providerPackages, providerPackagesError, providerPackagesIsError])

  React.useEffect(() => {
    handleApiResponse(supplierPackages, supplierPackagesError, supplierPackagesIsError, 'supplierPackages', setSupplierPackageOptions, (pkg: { _id: any; packageCode: any }) => ({
      key: pkg._id,
      value: pkg.packageCode,
    }))
  }, [supplierPackages, supplierPackagesError, supplierPackagesIsError])

  // Auto-calculate totalKm when openingKm or closingKm changes
  React.useEffect(() => {
    const totalKm = regularRequest.closingKm && regularRequest.openingKm ? regularRequest.closingKm - regularRequest.openingKm : 0
    setRegularRequest(prev => ({
      ...prev,
      totalKm: totalKm > 0 ? totalKm : null,
    }))
  }, [regularRequest.openingKm, regularRequest.closingKm])

  // Auto-calculate totalHr when pickUpDateTime or dropDateTime changes
  React.useEffect(() => {
    const totalHr = regularRequest.pickUpDateTime && regularRequest.dropDateTime ? (new Date(regularRequest.dropDateTime).getTime() - new Date(regularRequest.pickUpDateTime).getTime()) / (1000 * 60) : 0
    setRegularRequest(prev => ({
      ...prev,
      totalHr: totalHr > 0 ? totalHr : null,
    }))
  }, [regularRequest.pickUpDateTime, regularRequest.dropDateTime])

  const navigateBack = () => {
    navigate('/requests/regular')
  }

  const closeConfirmationPopUp = () => {
    if (showConfirmationModal) {
      setShowConfirmationModal(false)
    }
  }

  const submitHandler = async () => {
    // Check for API errors before validation
    const hasApiErrors = Object.values(apiErrors).some(error => error !== '')
    if (hasApiErrors) {
      console.log('Cannot submit: API errors present', apiErrors)
      return
    }

    // Ensure profit calculation is performed before submission
    performCalculation()

    const validationSchema = createValidationSchema(regularRequest)
    const { isValid, errorMap } = validatePayload(validationSchema, regularRequest)

    setIsValidationError(!isValid)
    setRegularRequestErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        if (isEditing) {
          await updateRegularRequestMutation.mutateAsync({ _id: requestId, ...regularRequest })
          setConfirmationPopUpType('update')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('Regular Request updated successfully!')
        } else {
          await createRegularRequest.mutateAsync(regularRequest)
          setConfirmationPopUpType('create')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('New Regular Request created successfully!')
        }

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to submit regular request', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Error')
        setConfirmationPopUpSubtitle(`Unable to ${isEditing ? 'update' : 'create'} regular request. Please try again.`)
        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      }
    } else {
      console.log('Submit Regular Request: Validation Error', errorMap)
    }
  }

  return (
    <>
      <div className={bemClass([blk])}>
        <div className={bemClass([blk, 'header'])}>
          <Text
            color="gray-darker"
            typography="l"
          >
            {isEditing ? 'Edit Regular Request' : 'New Regular Request'}
          </Text>
          <Breadcrumb
            data={[
              {
                label: 'Home',
                route: '/dashboard',
              },
              {
                label: 'Regular Requests',
                route: '/requests/regular',
              },
              {
                label: isEditing ? 'Edit Regular Request' : 'New Regular Request',
              },
            ]}
          />
        </div>
        {isValidationError && (
          <Alert
            type="error"
            message="There is an error with submission, please correct errors indicated below."
            className={bemClass([blk, 'margin-bottom'])}
          />
        )}
        {(apiErrors.customers || apiErrors.vehicles || apiErrors.suppliers || apiErrors.staff || apiErrors.packages || apiErrors.providerPackages || apiErrors.supplierPackages) && (
          <Alert
            type="error"
            message={`Some data could not be loaded: ${Object.values(apiErrors).filter(Boolean).join(' ')}`}
            className={bemClass([blk, 'margin-bottom'])}
          />
        )}
        <div className={bemClass([blk, 'content'])}>
          {/* Request Details Panel */}
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
                  question="Customer Type"
                  name="customerType"
                  options={[
                    { key: 'customer-type-existing', value: 'existing' },
                    { key: 'customer-type-new', value: 'new' },
                  ]}
                  value={regularRequest.customerType}
                  changeHandler={value => {
                    console.log('Customer Type Change:', value)
                    setRegularRequest(prev => ({
                      ...prev,
                      customerType: value.customerType as 'existing' | 'new',
                      customerCategory: value.customerType === 'new' ? null : prev.customerCategory,
                      customer: value.customerType === 'new' ? null : prev.customer,
                      customerDetails: value.customerType === 'existing' ? null : { name: '', contact: '', email: '' },
                    }))
                  }}
                  direction="horizontal"
                  required
                  errorMessage={regularRequestErrorMap['customerType']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Vehicle Type"
                  name="vehicleType"
                  options={[
                    { key: 'vehicle-type-existing', value: 'existing' },
                    { key: 'vehicle-type-new', value: 'new' },
                  ]}
                  value={regularRequest.vehicleType}
                  changeHandler={value => {
                    setRegularRequest(prev => ({
                      ...prev,
                      vehicleType: value.vehicleType as 'existing' | 'new',
                      vehicleCategory: value.vehicleType === 'new' ? null : prev.vehicleCategory,
                      vehicle: value.vehicleType === 'new' ? null : prev.vehicle,
                      vehicleDetails: value.vehicleType === 'existing' ? null : { ownerName: '', ownerContact: '', ownerEmail: '', manufacturer: '', name: '', registrationNo: '' },
                      packageFromProvidedVehicle: value.vehicleType === 'existing' ? undefined : { packageCategory: '', package: '' },
                    }))
                  }}
                  direction="horizontal"
                  required
                  errorMessage={regularRequestErrorMap['vehicleType']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Staff Type"
                  name="staffType"
                  options={[
                    { key: 'staff-type-existing', value: 'existing' },
                    { key: 'staff-type-new', value: 'new' },
                  ]}
                  value={regularRequest.staffType}
                  changeHandler={value => {
                    setRegularRequest(prev => ({
                      ...prev,
                      staffType: value.staffType as 'existing' | 'new',
                      staffCategory: value.staffType === 'new' ? null : prev.staffCategory,
                      staff: value.staffType === 'new' ? null : prev.staff,
                      staffDetails: value.staffType === 'existing' ? null : { name: '', contact: '', license: '' },
                    }))
                  }}
                  direction="horizontal"
                  required
                  errorMessage={regularRequestErrorMap['staffType']}
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <ConfiguredInput
                  label="Request Type"
                  name="requestType"
                  configToUse="Request type"
                  type={CONFIGURED_INPUT_TYPES.SELECT}
                  value={regularRequest.requestType}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestType: value.requestType?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['requestType']}
                  invalid={regularRequestErrorMap['requestType']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Pickup Location"
                  name="pickUpLocation"
                  value={regularRequest.pickUpLocation}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      pickUpLocation: value.pickUpLocation?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['pickUpLocation']}
                  invalid={regularRequestErrorMap['pickUpLocation']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Drop Location"
                  name="dropOffLocation"
                  value={regularRequest.dropOffLocation}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      dropOffLocation: value.dropOffLocation?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['dropOffLocation']}
                  invalid={regularRequestErrorMap['dropOffLocation']}
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
                  value={formatDateTimeForInput(regularRequest.pickUpDateTime)}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      pickUpDateTime: parseDateTimeFromInput(value.pickUpDateTime?.toString() || ''),
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['pickUpDateTime']}
                  invalid={regularRequestErrorMap['pickUpDateTime']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Drop Date and Time"
                  name="dropDateTime"
                  type="datetime-local"
                  value={formatDateTimeForInput(regularRequest.dropDateTime)}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      dropDateTime: parseDateTimeFromInput(value.dropDateTime?.toString() || ''),
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['dropDateTime']}
                  invalid={regularRequestErrorMap['dropDateTime']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'read-only'])}
              >
                <ReadOnlyText
                  label="Duration"
                  value={regularRequest.totalHr ? formatMinutesToDuration(regularRequest.totalHr) : '-'}
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
                  value={regularRequest.openingKm ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      openingKm: value.openingKm ? Number(value.openingKm) : null,
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['openingKm']}
                  invalid={regularRequestErrorMap['openingKm']}
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
                  value={regularRequest.closingKm ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      closingKm: value.closingKm ? Number(value.closingKm) : null,
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['closingKm']}
                  invalid={regularRequestErrorMap['closingKm']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'read-only'])}
              >
                <ReadOnlyText
                  label="Total Distance"
                  value={regularRequest.totalKm ? `${regularRequest.totalKm} km` : '-'}
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
                <RadioGroup
                  question="AC Required"
                  name="ac"
                  options={[
                    { key: 'ac-yes', value: 'Yes' },
                    { key: 'ac-no', value: 'No' },
                  ]}
                  value={regularRequest.ac ? 'Yes' : 'No'}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      ac: value.ac === 'Yes',
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
            </Row>
          </Panel>

          {/* Customer Details Panel */}
          <Panel
            title="Customer Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            {regularRequest.customerType === 'existing' ? (
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
                    value={regularRequest.customerCategory || ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        customerCategory: value.customerCategory?.toString() ?? '',
                        customer: null,
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['customerCategory']}
                    invalid={regularRequestErrorMap['customerCategory']}
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
                    value={regularRequest.customer ? ((customerOptions.find((option: any) => option.key === regularRequest.customer) as any)?.value ?? '') : ''}
                    changeHandler={value => {
                      if (isPlaceholderValue(value.customer?.toString() || '', 'customers')) return

                      const selectedOption = customerOptions.find((option: any) => option.value === value.customer) as any
                      setRegularRequest({
                        ...regularRequest,
                        customer: selectedOption?.key ?? '',
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['customer']}
                    invalid={regularRequestErrorMap['customer']}
                    disabled={!regularRequest.customerCategory || customersLoading || customersIsError}
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
                    value={regularRequest.customerDetails?.name ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        customerDetails: {
                          ...regularRequest.customerDetails!,
                          name: value.customerName?.toString() || '',
                        },
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['customerDetails.name']}
                    invalid={regularRequestErrorMap['customerDetails.name']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextInput
                    label="Customer Contact"
                    name="customerContact"
                    value={regularRequest.customerDetails?.contact ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        customerDetails: {
                          ...regularRequest.customerDetails!,
                          contact: value.customerContact?.toString() || '',
                        },
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['customerDetails.contact']}
                    invalid={regularRequestErrorMap['customerDetails.contact']}
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
                    value={regularRequest.customerDetails?.email ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        customerDetails: {
                          ...regularRequest.customerDetails!,
                          email: value.customerEmail?.toString() || '',
                        },
                      })
                    }}
                    errorMessage={regularRequestErrorMap['customerDetails.email']}
                    invalid={regularRequestErrorMap['customerDetails.email']}
                  />
                </Column>
              </Row>
            )}
          </Panel>
          {/* Vehicle Details Panel */}
          <Panel
            title="Vehicle Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            {regularRequest.vehicleType === 'existing' ? (
              <>
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
                      value={regularRequest.vehicleCategory || ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleCategory: value.vehicleCategory?.toString() ?? '',
                          supplier: null,
                          supplierPackage: null,
                          vehicle: null,
                        })
                      }}
                      required
                      errorMessage={regularRequestErrorMap['vehicleCategory']}
                      invalid={regularRequestErrorMap['vehicleCategory']}
                    />
                  </Column>
                </Row>
                {regularRequest.vehicleCategory && (
                  <Row>
                    {nameToPath(regularRequest.vehicleCategory) === 'supplier' && (
                      <>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <SelectInput
                            label="Supplier"
                            name="supplier"
                            options={getSelectOptions(suppliersLoading, suppliersIsError, supplierOptions, 'Please wait...', 'Unable to load options', 'No suppliers found')}
                            value={regularRequest.supplier ? ((supplierOptions.find((option: any) => option.key === regularRequest.supplier) as any)?.value ?? '') : ''}
                            changeHandler={value => {
                              if (isPlaceholderValue(value.supplier?.toString() || '', 'suppliers')) return
                              const selectedOption = supplierOptions.find((option: any) => option.value === value.supplier) as any
                              setRegularRequest({
                                ...regularRequest,
                                supplier: selectedOption?.key ?? '',
                                supplierPackage: null,
                                vehicle: null,
                              })
                            }}
                            required
                            errorMessage={regularRequestErrorMap['supplier']}
                            invalid={regularRequestErrorMap['supplier']}
                            disabled={suppliersLoading || suppliersIsError}
                          />
                        </Column>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <SelectInput
                            label="Supplier Package"
                            name="supplierPackage"
                            options={getSelectOptions(
                              supplierPackagesLoading,
                              supplierPackagesIsError,
                              regularRequest.supplier
                                ? supplierPackageOptions.filter((option: any) => {
                                    const pkg = supplierPackages?.data?.find((p: any) => p._id === option.key)
                                    return pkg?.supplier === regularRequest.supplier
                                  })
                                : [],
                              'Please wait...',
                              'Unable to load options',
                              'No supplier packages found',
                            )}
                            value={
                              regularRequest.supplierPackage
                                ? ((supplierPackageOptions.find((option: any) => option.key === regularRequest.supplierPackage) as any)?.value ?? '')
                                : ''
                            }
                            changeHandler={value => {
                              if (isPlaceholderValue(value.supplierPackage?.toString() || '', 'supplierPackages')) return

                              const selectedOption = supplierPackageOptions.find((option: any) => option.value === value.supplierPackage) as any
                              setRegularRequest({
                                ...regularRequest,
                                supplierPackage: selectedOption?.key ?? '',
                              })
                            }}
                            required
                            errorMessage={regularRequestErrorMap['supplierPackage']}
                            invalid={regularRequestErrorMap['supplierPackage']}
                            disabled={!regularRequest.supplier || supplierPackagesLoading || supplierPackagesIsError}
                          />
                        </Column>
                      </>
                    )}
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <SelectInput
                        label="Vehicle"
                        name="vehicle"
                        options={getSelectOptions(
                          vehiclesLoading,
                          vehiclesIsError,
                          nameToPath(regularRequest.vehicleCategory) === 'supplier' && regularRequest.supplier
                            ? vehicleOptions.filter((option: any) => {
                                const vehicle = vehicles?.data?.find((v: any) => v._id === option.key)
                                return vehicle?.supplier === regularRequest.supplier
                              })
                            : vehicleOptions,
                          'Please wait...',
                          'Unable to load options',
                          'No vehicles found',
                        )}
                        value={regularRequest.vehicle ? ((vehicleOptions.find((option: any) => option.key === regularRequest.vehicle) as any)?.value ?? '') : ''}
                        changeHandler={value => {
                          if (isPlaceholderValue(value.vehicle?.toString() || '', 'vehicles')) return

                          const selectedOption = vehicleOptions.find((option: any) => option.value === value.vehicle) as any
                          setRegularRequest({
                            ...regularRequest,
                            vehicle: selectedOption?.key ?? '',
                          })
                        }}
                        required
                        errorMessage={regularRequestErrorMap['vehicle']}
                        invalid={regularRequestErrorMap['vehicle']}
                        disabled={
                          !regularRequest.vehicleCategory ||
                          vehiclesLoading ||
                          vehiclesIsError ||
                          (nameToPath(regularRequest.vehicleCategory) === 'supplier' && !regularRequest.supplier)
                        }
                      />
                    </Column>
                  </Row>
                )}
              </>
            ) : (
              <>
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Owner Name"
                      name="ownerName"
                      value={regularRequest.vehicleDetails?.ownerName ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ...regularRequest.vehicleDetails!,
                            ownerName: value.ownerName?.toString() || '',
                          },
                        })
                      }}
                      required
                      errorMessage={regularRequestErrorMap['vehicleDetails.ownerName']}
                      invalid={regularRequestErrorMap['vehicleDetails.ownerName']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Owner Contact"
                      name="ownerContact"
                      value={regularRequest.vehicleDetails?.ownerContact ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ...regularRequest.vehicleDetails!,
                            ownerContact: value.ownerContact?.toString() || '',
                          },
                        })
                      }}
                      required
                      errorMessage={regularRequestErrorMap['vehicleDetails.ownerContact']}
                      invalid={regularRequestErrorMap['vehicleDetails.ownerContact']}
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
                      value={regularRequest.vehicleDetails?.ownerEmail ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ...regularRequest.vehicleDetails!,
                            ownerEmail: value.ownerEmail?.toString() || '',
                          },
                        })
                      }}
                      errorMessage={regularRequestErrorMap['vehicleDetails.ownerEmail']}
                      invalid={regularRequestErrorMap['vehicleDetails.ownerEmail']}
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
                      value={regularRequest.vehicleDetails?.manufacturer ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ...regularRequest.vehicleDetails!,
                            manufacturer: value.manufacturer?.toString() || '',
                          },
                        })
                      }}
                      required
                      errorMessage={regularRequestErrorMap['vehicleDetails.manufacturer']}
                      invalid={regularRequestErrorMap['vehicleDetails.manufacturer']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Vehicle Name"
                      name="vehicleName"
                      value={regularRequest.vehicleDetails?.name ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ...regularRequest.vehicleDetails!,
                            name: value.vehicleName?.toString() || '',
                          },
                        })
                      }}
                      required
                      errorMessage={regularRequestErrorMap['vehicleDetails.name']}
                      invalid={regularRequestErrorMap['vehicleDetails.name']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Registration Number"
                      name="registrationNo"
                      value={regularRequest.vehicleDetails?.registrationNo ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ...regularRequest.vehicleDetails!,
                            registrationNo: value.registrationNo?.toString() || '',
                          },
                        })
                      }}
                      required
                      errorMessage={regularRequestErrorMap['vehicleDetails.registrationNo']}
                      invalid={regularRequestErrorMap['vehicleDetails.registrationNo']}
                    />
                  </Column>
                </Row>
              </>
            )}
          </Panel>

          {/* Provider Package Details Panel */}
          {regularRequest.vehicleType === 'new' && (
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
                    value={regularRequest.packageFromProvidedVehicle?.packageCategory || ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        packageFromProvidedVehicle: {
                          packageCategory: value.providerPackageCategory?.toString() ?? '',
                          package: regularRequest.packageFromProvidedVehicle?.package ?? '',
                        },
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['packageFromProvidedVehicle.packageCategory']}
                    invalid={regularRequestErrorMap['packageFromProvidedVehicle.packageCategory']}
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
                    value={regularRequest.packageFromProvidedVehicle?.package ? ((providerPackageOptions.find((option: any) => option.key === regularRequest.packageFromProvidedVehicle?.package) as any)?.value ?? '') : ''}
                    changeHandler={value => {
                      if (isPlaceholderValue(value.providerPackage?.toString() || '', 'providerPackages')) return

                      const selectedOption = providerPackageOptions.find((option: any) => option.value === value.providerPackage) as any
                      setRegularRequest({
                        ...regularRequest,
                        packageFromProvidedVehicle: {
                          packageCategory: regularRequest.packageFromProvidedVehicle?.packageCategory ?? '',
                          package: selectedOption?.key ?? '',
                        },
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['packageFromProvidedVehicle.package']}
                    invalid={regularRequestErrorMap['packageFromProvidedVehicle.package']}
                    disabled={!regularRequest.packageFromProvidedVehicle?.packageCategory || providerPackagesLoading || providerPackagesIsError}
                  />
                </Column>
              </Row>
            </Panel>
          )}

          {/* Staff Details Panel */}
          <Panel
            title="Staff Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            {regularRequest.staffType === 'existing' ? (
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
                    value={regularRequest.staffCategory || ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        staffCategory: value.staffCategory?.toString() ?? '',
                        staff: null,
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['staffCategory']}
                    invalid={regularRequestErrorMap['staffCategory']}
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
                    value={regularRequest.staff ? ((staffOptions.find((option: any) => option.key === regularRequest.staff) as any)?.value ?? '') : ''}
                    changeHandler={value => {
                      if (isPlaceholderValue(value.staff?.toString() || '', 'staff')) return

                      const selectedOption = staffOptions.find((option: any) => option.value === value.staff) as any
                      setRegularRequest({
                        ...regularRequest,
                        staff: selectedOption?.key ?? '',
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['staff']}
                    invalid={regularRequestErrorMap['staff']}
                    disabled={!regularRequest.staffCategory || staffLoading || staffIsError}
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
                    label="Staff Name"
                    name="staffName"
                    value={regularRequest.staffDetails?.name ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        staffDetails: {
                          ...regularRequest.staffDetails!,
                          name: value.staffName?.toString() || '',
                        },
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['staffDetails.name']}
                    invalid={regularRequestErrorMap['staffDetails.name']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextInput
                    label="Staff Contact"
                    name="staffContact"
                    value={regularRequest.staffDetails?.contact ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        staffDetails: {
                          ...regularRequest.staffDetails!,
                          contact: value.staffContact?.toString() || '',
                        },
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['staffDetails.contact']}
                    invalid={regularRequestErrorMap['staffDetails.contact']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextInput
                    label="Staff License"
                    name="staffLicense"
                    value={regularRequest.staffDetails?.license ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        staffDetails: {
                          ...regularRequest.staffDetails!,
                          license: value.staffLicense?.toString() || '',
                        },
                      })
                    }}
                    required
                    errorMessage={regularRequestErrorMap['staffDetails.license']}
                    invalid={regularRequestErrorMap['staffDetails.license']}
                  />
                </Column>
              </Row>
            )}
          </Panel>

          {/* Package Details Panel */}
          <Panel
            title="Package Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <ConfiguredInput
                  label="Package Category"
                  name="packageCategory"
                  configToUse="Package category"
                  type={CONFIGURED_INPUT_TYPES.SELECT}
                  value={regularRequest.packageCategory || ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      packageCategory: value.packageCategory?.toString() ?? '',
                      package: null,
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['packageCategory']}
                  invalid={regularRequestErrorMap['packageCategory']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Package"
                  name="package"
                  options={getSelectOptions(packagesLoading, packagesIsError, packageOptions, 'Please wait...', 'Unable to load options', 'No packages found')}
                  value={regularRequest.package ? ((packageOptions.find((option: any) => option.key === regularRequest.package) as any)?.value ?? '') : ''}
                  changeHandler={value => {
                    if (isPlaceholderValue(value.package?.toString() || '', 'packages')) return

                    const selectedOption = packageOptions.find((option: any) => option.value === value.package) as any
                    setRegularRequest({
                      ...regularRequest,
                      package: selectedOption?.key ?? '',
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['package']}
                  invalid={regularRequestErrorMap['package']}
                  disabled={!regularRequest.packageCategory || packagesLoading || packagesIsError}
                />
              </Column>
            </Row>
          </Panel>
          {/* Other Charges Panel */}
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
                    checked={regularRequest.otherCharges.toll.isChargeableToCustomer}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        otherCharges: {
                          ...regularRequest.otherCharges,
                          toll: {
                            ...regularRequest.otherCharges.toll,
                            isChargeableToCustomer: value.tollChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="tollAmount"
                  type="number"
                  placeholder="Toll Amount"
                  value={regularRequest.otherCharges.toll.amount ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        toll: {
                          ...regularRequest.otherCharges.toll,
                          amount: value.tollAmount ? Number(value.tollAmount) : '',
                        },
                      },
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['otherCharges.toll.amount']}
                  invalid={regularRequestErrorMap['otherCharges.toll.amount']}
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
                    checked={regularRequest.otherCharges.parking.isChargeableToCustomer}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        otherCharges: {
                          ...regularRequest.otherCharges,
                          parking: {
                            ...regularRequest.otherCharges.parking,
                            isChargeableToCustomer: value.parkingChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="parkingAmount"
                  type="number"
                  placeholder="Parking Amount"
                  value={regularRequest.otherCharges.parking.amount ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        parking: {
                          ...regularRequest.otherCharges.parking,
                          amount: value.parkingAmount ? Number(value.parkingAmount) : '',
                        },
                      },
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['otherCharges.parking.amount']}
                  invalid={regularRequestErrorMap['otherCharges.parking.amount']}
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
                    checked={regularRequest.otherCharges.nightHalt.isChargeableToCustomer}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        otherCharges: {
                          ...regularRequest.otherCharges,
                          nightHalt: {
                            ...regularRequest.otherCharges.nightHalt,
                            isChargeableToCustomer: value.nightHaltChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="nightHaltAmount"
                  type="number"
                  placeholder="Night Halt Amount"
                  value={regularRequest.otherCharges.nightHalt.amount ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        nightHalt: {
                          ...regularRequest.otherCharges.nightHalt,
                          amount: value.nightHaltAmount ? Number(value.nightHaltAmount) : '',
                        },
                      },
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['otherCharges.nightHalt.amount']}
                  invalid={regularRequestErrorMap['otherCharges.nightHalt.amount']}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <Toggle
                  className={bemClass([blk, 'toggle'])}
                  label="Include Night Halt in driver salary?"
                  name="nightHaltPayableWithSalary"
                  checked={regularRequest.otherCharges.nightHalt.isPayableWithSalary}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        nightHalt: {
                          ...regularRequest.otherCharges.nightHalt,
                          isPayableWithSalary: !!value.nightHaltPayableWithSalary,
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
                    Driver Allowance
                  </Text>
                  <CheckBox
                    id="driverAllowanceChargeableToCustomer"
                    label="Chargeable to customer"
                    checked={regularRequest.otherCharges.driverAllowance.isChargeableToCustomer}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        otherCharges: {
                          ...regularRequest.otherCharges,
                          driverAllowance: {
                            ...regularRequest.otherCharges.driverAllowance,
                            isChargeableToCustomer: value.driverAllowanceChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="driverAllowanceAmount"
                  type="number"
                  placeholder="Driver Allowance Amount"
                  value={regularRequest.otherCharges.driverAllowance.amount ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        driverAllowance: {
                          ...regularRequest.otherCharges.driverAllowance,
                          amount: value.driverAllowanceAmount ? Number(value.driverAllowanceAmount) : '',
                        },
                      },
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['otherCharges.driverAllowance.amount']}
                  invalid={regularRequestErrorMap['otherCharges.driverAllowance.amount']}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <Toggle
                  className={bemClass([blk, 'toggle'])}
                  label="Include Driver Allowance in driver salary?"
                  name="driverAllowancePayableWithSalary"
                  checked={regularRequest.otherCharges.driverAllowance.isPayableWithSalary}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        driverAllowance: {
                          ...regularRequest.otherCharges.driverAllowance,
                          isPayableWithSalary: !!value.driverAllowancePayableWithSalary,
                        },
                      },
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>

          {/* Advanced Payment Panel */}
          <Panel
            title="Advanced Payment"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Advanced from Customer"
                  name="advancedFromCustomer"
                  type="number"
                  value={regularRequest.advancedPayment.advancedFromCustomer ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      advancedPayment: {
                        ...regularRequest.advancedPayment,
                        advancedFromCustomer: value.advancedFromCustomer ? Number(value.advancedFromCustomer) : '',
                      },
                    })
                  }}
                  errorMessage={regularRequestErrorMap['advancedPayment.advancedFromCustomer']}
                  invalid={regularRequestErrorMap['advancedPayment.advancedFromCustomer']}
                />
              </Column>
              {regularRequest.vehicleCategory && nameToPath(regularRequest.vehicleCategory) === 'supplier' && (
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextInput
                    label="Advanced to Supplier"
                    name="advancedToSupplier"
                    type="number"
                    value={regularRequest.advancedPayment.advancedToSupplier ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        advancedPayment: {
                          ...regularRequest.advancedPayment,
                          advancedToSupplier: value.advancedToSupplier ? Number(value.advancedToSupplier) : '',
                        },
                      })
                    }}
                    errorMessage={regularRequestErrorMap['advancedPayment.advancedToSupplier']}
                    invalid={regularRequestErrorMap['advancedPayment.advancedToSupplier']}
                  />
                </Column>
              )}
            </Row>
          </Panel>

          {/* Payment Details Panel */}
          <Panel
            title="Payment Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Payment Status"
                  name="paymentStatus"
                  options={[
                    { key: 'BILL_GENERATED', value: 'Bill Generated' },
                    { key: 'BILL_SENT_TO_CUSTOMER', value: 'Bill Sent to Customer' },
                    { key: 'PAYMENT_RECEIVED', value: 'Payment Received' },
                  ]}
                  value={
                    regularRequest.paymentDetails.status === 'BILL_GENERATED'
                      ? 'Bill Generated'
                      : regularRequest.paymentDetails.status === 'BILL_SENT_TO_CUSTOMER'
                        ? 'Bill Sent to Customer'
                        : regularRequest.paymentDetails.status === 'PAYMENT_RECEIVED'
                          ? 'Payment Received'
                          : ''
                  }
                  changeHandler={value => {
                    let status: '' | 'BILL_GENERATED' | 'BILL_SENT_TO_CUSTOMER' | 'PAYMENT_RECEIVED' = ''

                    if (value.paymentStatus === 'Bill Generated') {
                      status = 'BILL_GENERATED'
                    } else if (value.paymentStatus === 'Bill Sent to Customer') {
                      status = 'BILL_SENT_TO_CUSTOMER'
                    } else if (value.paymentStatus === 'Payment Received') {
                      status = 'PAYMENT_RECEIVED'
                    }

                    setRegularRequest({
                      ...regularRequest,
                      paymentDetails: {
                        ...regularRequest.paymentDetails,
                        status: status,
                      },
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['paymentDetails.status']}
                  invalid={regularRequestErrorMap['paymentDetails.status']}
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
                  value={regularRequest.paymentDetails.paymentMethod}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      paymentDetails: {
                        ...regularRequest.paymentDetails,
                        paymentMethod: value.paymentMethod?.toString() ?? '',
                      },
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['paymentDetails.paymentMethod']}
                  invalid={regularRequestErrorMap['paymentDetails.paymentMethod']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Payment Date"
                  name="paymentDate"
                  type="date"
                  value={regularRequest.paymentDetails.paymentDate ? new Date(regularRequest.paymentDetails.paymentDate).toISOString().slice(0, 10) : ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      paymentDetails: {
                        ...regularRequest.paymentDetails,
                        paymentDate: value.paymentDate ? new Date(value.paymentDate) : null,
                      },
                    })
                  }}
                  required
                  errorMessage={regularRequestErrorMap['paymentDetails.paymentDate']}
                  invalid={regularRequestErrorMap['paymentDetails.paymentDate']}
                />
              </Column>
            </Row>
          </Panel>

          {/* Comments Panel */}
          <Panel
            title="Comments"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <TextArea
              className={bemClass([blk, 'margin-bottom'])}
              name="comment"
              value={regularRequest.comment}
              changeHandler={value => {
                setRegularRequest({
                  ...regularRequest,
                  comment: value.comment?.toString() ?? '',
                })
              }}
              placeholder="Enter any additional comments or notes here..."
            />
          </Panel>

          <div className={bemClass([blk, 'request-calculation'])}>
            <Text
              tag="p"
              typography="s"
              color="gray-darker"
            >
              Request Calculation
            </Text>
            <Button
              size="medium"
              category="primary"
              clickHandler={calculateProfit}
            >
              Calculate
            </Button>
          </div>

          {/* Calculation Results Panel */}
          <Panel
            title="Calculation Results"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <ReadOnlyText
                  label="Request Total"
                  value={`₹${regularRequest.requestTotal.toLocaleString()}`}
                  color="success"
                  size="jumbo"
                />
              </Column>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <ReadOnlyText
                  label="Request Expense"
                  value={`₹${regularRequest.requestExpense.toLocaleString()}`}
                  color="warning"
                  size="jumbo"
                />
              </Column>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <ReadOnlyText
                  label="Request Profit"
                  value={`₹${regularRequest.requestProfit.toLocaleString()}`}
                  color={regularRequest.requestProfit >= 0 ? "success" : "error"}
                  size="jumbo"
                />
              </Column>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <ReadOnlyText
                  label="Customer Bill"
                  value={`₹${regularRequest.customerBill.toLocaleString()}`}
                  color="primary"
                  size="jumbo"
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
              clickHandler={submitHandler}
            >
              {isEditing ? 'Update' : 'Submit'}
            </Button>
          </div>
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
    </>
  )
}

export default CreateRegularRequest
