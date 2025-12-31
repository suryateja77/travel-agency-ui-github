import {
  Breadcrumb,
  Text,
  Panel,
  Row,
  Column,
  TextInput,
  NumberInput,
  DateTimeInput,
  RadioGroup,
  Alert,
  ReadOnlyText,
  SelectInput,
  Toggle,
  CheckBox,
  TextArea,
  Button,
  Modal,
} from '@base'
import { RegularRequestModel, INITIAL_REGULAR_REQUEST, PackageModel } from '@types'
import { bemClass, nameToPath, validatePayload } from '@utils'
import { useToast } from '@contexts/ToastContext'
import Loader from '@components/loader'
import React, { FunctionComponent, useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'
import { usePackageByCategory, usePackageByCategoryWithFilter } from '@api/queries/package'
import { useCustomerByCategory } from '@api/queries/customer'
import { useVehicleByCategory } from '@api/queries/vehicle'
import { useSuppliersQuery } from '@api/queries/supplier'
import { useStaffByCategory } from '@api/queries/staff'
import { useCreateRegularRequestMutation, useUpdateRegularRequestMutation, useRegularRequestByIdQuery } from '@api/queries/regular-request'
import { createValidationSchema, calculateTotalValidationSchema } from './validation'

import './style.scss'

const blk = 'create-regular-request'

interface CreateRegularRequestProps {}

// Helper function to extract ID from populated or unpopulated field
const extractIdFromResponse = (field: any): string | null => {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object' && field._id) return field._id
  return null
}

// Transform API response to match RegularRequestModel structure
const transformRegularRequestResponse = (response: any): RegularRequestModel => {
  return {
    packageDetails: {
      packageCategory: response.packageDetails?.packageCategory || '',
      package: extractIdFromResponse(response.packageDetails?.package) || '',
    },
    requestDetails: {
      requestType: response.requestDetails?.requestType || '',
      pickUpLocation: response.requestDetails?.pickUpLocation || '',
      dropOffLocation: response.requestDetails?.dropOffLocation || '',
      pickUpDateTime: response.requestDetails?.pickUpDateTime ? new Date(response.requestDetails.pickUpDateTime) : null,
      dropDateTime: response.requestDetails?.dropDateTime ? new Date(response.requestDetails.dropDateTime) : null,
      openingKm: response.requestDetails?.openingKm || null,
      closingKm: response.requestDetails?.closingKm || null,
      totalKm: response.requestDetails?.totalKm || null,
      totalHr: response.requestDetails?.totalHr || null,
      ac: response.requestDetails?.ac ?? true,
    },
    customerDetails: {
      customerType: response.customerDetails?.customerType || 'existing',
      customerCategory: response.customerDetails?.customerCategory || null,
      customer: extractIdFromResponse(response.customerDetails?.customer),
      newCustomerDetails: response.customerDetails?.newCustomerDetails || null,
    },
    vehicleDetails: {
      vehicleType: response.vehicleDetails?.vehicleType || 'existing',
      vehicleCategory: response.vehicleDetails?.vehicleCategory || null,
      vehicle: extractIdFromResponse(response.vehicleDetails?.vehicle),
      supplierDetails: {
        supplier: extractIdFromResponse(response.vehicleDetails?.supplierDetails?.supplier),
        package: extractIdFromResponse(response.vehicleDetails?.supplierDetails?.package),
      },
      newVehicleDetails: response.vehicleDetails?.newVehicleDetails || null,
    },
    staffDetails: {
      staffType: response.staffDetails?.staffType || 'existing',
      staffCategory: response.staffDetails?.staffCategory || null,
      staff: extractIdFromResponse(response.staffDetails?.staff),
      newStaffDetails: response.staffDetails?.newStaffDetails || null,
    },
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
    status: response.status || 'ONGOING',
    paymentDetails: {
      amountPaid: response.paymentDetails?.amountPaid || 0,
      paymentMethod: response.paymentDetails?.paymentMethod || '',
      paymentDate: response.paymentDetails?.paymentDate ? new Date(response.paymentDetails.paymentDate) : null,
    },
    requestTotal: response.requestTotal || 0,
    requestExpense: response.requestExpense || 0,
    requestProfit: response.requestProfit || 0,
    customerBill: response.customerBill || 0,
    comment: response.comment || '',
  }
}

const CreateRegularRequest: FunctionComponent<CreateRegularRequestProps> = () => {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const createRegularRequestMutation = useCreateRegularRequestMutation()
  const updateRegularRequestMutation = useUpdateRegularRequestMutation()

  // Fetch regular request data when in edit mode
  const { data: regularRequestData, isLoading: isLoadingRequest, isError: regularRequestIsError, error: regularRequestError } = useRegularRequestByIdQuery(id || '')

  const [regularRequest, setRegularRequest] = useState<RegularRequestModel>(INITIAL_REGULAR_REQUEST)
  const [regularRequestErrorMap, setRegularRequestErrorMap] = useState<Record<string, any>>({})
  const [isValidationError, setIsValidationError] = useState(false)
  const [validationErrorType, setValidationErrorType] = useState<'calculate' | 'submit' | null>(null)
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false)
  const [packageOptions, setPackageOptions] = useState<{ key: any; value: any }[]>([])
  const [customerOptions, setCustomerOptions] = useState<{ key: any; value: any }[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<{ key: any; value: any }[]>([])
  const [supplierVehicleOptions, setSupplierVehicleOptions] = useState<{ key: any; value: any }[]>([])
  const [supplierOptions, setSupplierOptions] = useState<{ key: any; value: any }[]>([])
  const [supplierPackageOptions, setSupplierPackageOptions] = useState<{ key: any; value: any }[]>([])
  const [staffOptions, setStaffOptions] = useState<{ key: any; value: any }[]>([])
  const [apiErrors, setApiErrors] = useState({
    packages: '',
    customers: '',
    vehicles: '',
    suppliers: '',
    supplierPackages: '',
    staff: '',
  })
  const [showCalculationModal, setShowCalculationModal] = useState(false)

  // Category path for package API query
  const packageCategoryPath = useMemo(() => {
    return regularRequest.packageDetails.packageCategory ? nameToPath(regularRequest.packageDetails.packageCategory) : ''
  }, [regularRequest.packageDetails.packageCategory])

  // Category path for customer API query
  const customerCategoryPath = useMemo(() => {
    return regularRequest.customerDetails.customerType === 'existing' && regularRequest.customerDetails.customerCategory
      ? nameToPath(regularRequest.customerDetails.customerCategory)
      : ''
  }, [regularRequest.customerDetails.customerType, regularRequest.customerDetails.customerCategory])

  // Category path for vehicle API query
  const vehicleCategoryPath = useMemo(() => {
    return regularRequest.vehicleDetails.vehicleType === 'existing' && regularRequest.vehicleDetails.vehicleCategory
      ? nameToPath(regularRequest.vehicleDetails.vehicleCategory)
      : ''
  }, [regularRequest.vehicleDetails.vehicleType, regularRequest.vehicleDetails.vehicleCategory])

  // API query for packages
  const { data: packages, error: packagesError, isLoading: packagesLoading, isError: packagesIsError } = usePackageByCategory(packageCategoryPath)

  // API query for customers
  const { data: customers, error: customersError, isLoading: customersLoading, isError: customersIsError } = useCustomerByCategory(customerCategoryPath)

  // API query for vehicles
  const { data: vehicles, error: vehiclesError, isLoading: vehiclesLoading, isError: vehiclesIsError } = useVehicleByCategory(vehicleCategoryPath)

  // Category path for staff API query
  const staffCategoryPath = useMemo(() => {
    return regularRequest.staffDetails.staffType === 'existing' && regularRequest.staffDetails.staffCategory ? nameToPath(regularRequest.staffDetails.staffCategory) : ''
  }, [regularRequest.staffDetails.staffType, regularRequest.staffDetails.staffCategory])

  // API query for staff
  const { data: staff, error: staffError, isLoading: staffLoading, isError: staffIsError } = useStaffByCategory(staffCategoryPath)

  // Check if supplier vehicle
  const isSupplierVehicle =
    regularRequest.vehicleDetails.vehicleType === 'existing' &&
    regularRequest.vehicleDetails.vehicleCategory &&
    nameToPath(regularRequest.vehicleDetails.vehicleCategory) === 'supplier'

  // API query for suppliers (only when supplier vehicle)
  const { data: suppliers, error: suppliersError, isLoading: suppliersLoading, isError: suppliersIsError } = useSuppliersQuery(!!isSupplierVehicle)

  // API query for supplier vehicles (only when supplier is selected)
  const supplierVehicleFilter =
    isSupplierVehicle && regularRequest.vehicleDetails.supplierDetails.supplier ? { supplier: regularRequest.vehicleDetails.supplierDetails.supplier } : null
  const { data: supplierVehicles, error: supplierVehiclesError, isLoading: supplierVehiclesLoading, isError: supplierVehiclesIsError } = useVehicleByCategory('supplier')

  // API query for supplier packages (only when supplier is selected)
  const supplierPackageFilter =
    isSupplierVehicle && regularRequest.vehicleDetails.supplierDetails.supplier ? { supplier: regularRequest.vehicleDetails.supplierDetails.supplier } : null
  const {
    data: supplierPackages,
    error: supplierPackagesError,
    isLoading: supplierPackagesLoading,
    isError: supplierPackagesIsError,
  } = usePackageByCategoryWithFilter('supplier', supplierPackageFilter)

  // Calculate other charges that are expenses (not chargeable to customer)
  const calculateOtherChargesExpenses = () => {
    const { toll, parking, nightHalt, driverAllowance } = regularRequest.otherCharges
    const tollAmount = toll.isChargeableToCustomer ? 0 : Number(toll.amount)
    const parkingAmount = parking.isChargeableToCustomer ? 0 : Number(parking.amount)
    const nightHaltAmount = nightHalt.isChargeableToCustomer ? 0 : Number(nightHalt.amount)
    const driverAllowanceAmount = driverAllowance.isChargeableToCustomer ? 0 : Number(driverAllowance.amount)
    return tollAmount + parkingAmount + nightHaltAmount + driverAllowanceAmount
  }

  // Calculate other charges that are chargeable to customer
  const calculateOtherChargesForCustomer = () => {
    const { toll, parking, nightHalt, driverAllowance } = regularRequest.otherCharges
    const tollAmount = toll.isChargeableToCustomer ? Number(toll.amount) : 0
    const parkingAmount = parking.isChargeableToCustomer ? Number(parking.amount) : 0
    const nightHaltAmount = nightHalt.isChargeableToCustomer ? Number(nightHalt.amount) : 0
    const driverAllowanceAmount = driverAllowance.isChargeableToCustomer ? Number(driverAllowance.amount) : 0
    return tollAmount + parkingAmount + nightHaltAmount + driverAllowanceAmount
  }

  // Calculate total amount from package details
  const calculatePackageTotal = (packageDetail: PackageModel, totalKm: number = 0, totalHr: number = 0) => {
    const { baseAmount, minimumKm, extraKmPerKmRate, minimumHr, extraHrPerHrRate } = packageDetail
    const extraKm = totalKm - Number(minimumKm) < 0 ? 0 : totalKm - Number(minimumKm)
    const extraHr = totalHr - Number(minimumHr) < 0 ? 0 : totalHr - Number(minimumHr)
    const extraKmBilling = extraKm * Number(extraKmPerKmRate)
    const extraHrBilling = extraHr * Number(extraHrPerHrRate)
    return Number(baseAmount) + extraKmBilling + extraHrBilling
  }

  // Perform profit calculation
  const performCalculation = () => {
    const { requestDetails, packageDetails, vehicleDetails } = regularRequest

    // Calculate total distance and time
    const totalKm = requestDetails.closingKm && requestDetails.openingKm ? requestDetails.closingKm - requestDetails.openingKm : 0
    const totalHr =
      requestDetails.pickUpDateTime && requestDetails.dropDateTime
        ? (new Date(requestDetails.dropDateTime).getTime() - new Date(requestDetails.pickUpDateTime).getTime()) / (1000 * 60 * 60)
        : 0

    console.log('Total Hr:', totalHr)
    // Find customer package details from packages query data
    const customerPackageId = typeof packageDetails.package === 'string' ? packageDetails.package : (packageDetails.package as any)?._id
    const customerPackage = packages?.data?.find((p: PackageModel) => p._id === customerPackageId)

    if (!customerPackage) {
      console.error('Customer package not found')
      return
    }

    // Calculate customer total from their package
    const customerTotal = calculatePackageTotal(customerPackage, totalKm, totalHr)

    // Calculate supplier/provider vehicle expense
    let supplierVehicleExpense = 0

    // Check if supplier vehicle (existing vehicle with supplier category)
    if (
      vehicleDetails.vehicleType === 'existing' &&
      vehicleDetails.vehicleCategory &&
      nameToPath(vehicleDetails.vehicleCategory) === 'supplier' &&
      vehicleDetails.supplierDetails.package
    ) {
      const supplierPackageId =
        typeof vehicleDetails.supplierDetails.package === 'string' ? vehicleDetails.supplierDetails.package : (vehicleDetails.supplierDetails.package as any)?._id
      const supplierPackage = supplierPackages?.data?.find((p: PackageModel) => p._id === supplierPackageId)

      if (supplierPackage) {
        supplierVehicleExpense = calculatePackageTotal(supplierPackage, totalKm, totalHr)
      }
    }

    // Check if new vehicle with provider package
    if (vehicleDetails.vehicleType === 'new' && vehicleDetails.newVehicleDetails?.package) {
      // For new vehicles, we would need to query provider packages
      // This would require additional API query setup similar to supplier packages
      console.log('New vehicle provider package calculation - to be implemented if needed')
    }

    // Calculate other charges
    const otherChargesExpense = calculateOtherChargesExpenses()
    const otherChargesForCustomer = calculateOtherChargesForCustomer()

    // Calculate profit: customer total - supplier expense - other charges expense
    const profit = customerTotal - supplierVehicleExpense - otherChargesExpense

    console.log('Profit Calculation:', {
      customerTotal,
      supplierVehicleExpense,
      otherChargesExpense,
      profit,
      otherChargesForCustomer,
      totalKm,
      totalHr,
    })

    // Update state with calculated values
    setRegularRequest(prev => ({
      ...prev,
      requestDetails: {
        ...prev.requestDetails,
        totalKm,
        totalHr,
      },
      requestTotal: customerTotal,
      requestExpense: supplierVehicleExpense + otherChargesExpense,
      requestProfit: profit,
      customerBill: customerTotal + otherChargesForCustomer,
    }))
  }

  // Calculate profit with validation
  const calculateProfit = () => {
    const validationSchema = calculateTotalValidationSchema(regularRequest)
    const { isValid, errorMap } = validatePayload(validationSchema, regularRequest)

    setRegularRequestErrorMap(prev => ({ ...prev, ...errorMap }))
    setIsValidationError(!isValid)
    setValidationErrorType(!isValid ? 'calculate' : null)

    if (!isValid) {
      console.log('Calculation validation failed:', errorMap)
      return
    }

    performCalculation()
  }

  // View calculation breakdown
  const viewCalculationBreakdown = () => {
    calculateProfit()
    setShowCalculationModal(true)
  }

  // Get calculation breakdown data
  const getCalculationBreakdown = () => {
    const { requestDetails, packageDetails, vehicleDetails, otherCharges } = regularRequest

    // Calculate total distance and time
    const totalKm = requestDetails.closingKm && requestDetails.openingKm ? requestDetails.closingKm - requestDetails.openingKm : 0
    const totalHr =
      requestDetails.pickUpDateTime && requestDetails.dropDateTime
        ? (new Date(requestDetails.dropDateTime).getTime() - new Date(requestDetails.pickUpDateTime).getTime()) / (1000 * 60 * 60)
        : 0

    // Find customer package
    const customerPackageId = typeof packageDetails.package === 'string' ? packageDetails.package : (packageDetails.package as any)?._id
    const customerPackage = packages?.data?.find((p: PackageModel) => p._id === customerPackageId)

    // Calculate customer package breakdown
    let customerPackageBreakdown = null
    if (customerPackage) {
      const extraKm = totalKm - Number(customerPackage.minimumKm) < 0 ? 0 : totalKm - Number(customerPackage.minimumKm)
      const extraHr = totalHr - Number(customerPackage.minimumHr) < 0 ? 0 : totalHr - Number(customerPackage.minimumHr)
      const extraKmBilling = extraKm * Number(customerPackage.extraKmPerKmRate)
      const extraHrBilling = extraHr * Number(customerPackage.extraHrPerHrRate)

      customerPackageBreakdown = {
        baseAmount: Number(customerPackage.baseAmount),
        minimumKm: Number(customerPackage.minimumKm),
        minimumHr: Number(customerPackage.minimumHr),
        totalKm,
        totalHr,
        extraKm,
        extraHr,
        extraKmPerKmRate: Number(customerPackage.extraKmPerKmRate),
        extraHrPerHrRate: Number(customerPackage.extraHrPerHrRate),
        extraKmBilling,
        extraHrBilling,
        total: Number(customerPackage.baseAmount) + extraKmBilling + extraHrBilling,
      }
    }

    // Calculate supplier vehicle expense breakdown
    let supplierExpenseBreakdown = null
    const isSupplierVehicle =
      vehicleDetails.vehicleType === 'existing' &&
      vehicleDetails.vehicleCategory &&
      nameToPath(vehicleDetails.vehicleCategory) === 'supplier' &&
      vehicleDetails.supplierDetails.package

    if (isSupplierVehicle) {
      const supplierPackageId =
        typeof vehicleDetails.supplierDetails.package === 'string' ? vehicleDetails.supplierDetails.package : (vehicleDetails.supplierDetails.package as any)?._id
      const supplierPackage = supplierPackages?.data?.find((p: PackageModel) => p._id === supplierPackageId)

      if (supplierPackage) {
        const extraKm = totalKm - Number(supplierPackage.minimumKm) < 0 ? 0 : totalKm - Number(supplierPackage.minimumKm)
        const extraHr = totalHr - Number(supplierPackage.minimumHr) < 0 ? 0 : totalHr - Number(supplierPackage.minimumHr)
        const extraKmExpense = extraKm * Number(supplierPackage.extraKmPerKmRate)
        const extraHrExpense = extraHr * Number(supplierPackage.extraHrPerHrRate)

        supplierExpenseBreakdown = {
          baseAmount: Number(supplierPackage.baseAmount),
          minimumKm: Number(supplierPackage.minimumKm),
          minimumHr: Number(supplierPackage.minimumHr),
          totalKm,
          totalHr,
          extraKm,
          extraHr,
          extraKmPerKmRate: Number(supplierPackage.extraKmPerKmRate),
          extraHrPerHrRate: Number(supplierPackage.extraHrPerHrRate),
          extraKmExpense,
          extraHrExpense,
          total: Number(supplierPackage.baseAmount) + extraKmExpense + extraHrExpense,
        }
      }
    }

    // Calculate other charges breakdown
    const otherChargesBreakdown = {
      toll: {
        amount: Number(otherCharges.toll.amount),
        isChargeableToCustomer: otherCharges.toll.isChargeableToCustomer,
        expense: otherCharges.toll.isChargeableToCustomer ? 0 : Number(otherCharges.toll.amount),
        customerCharge: otherCharges.toll.isChargeableToCustomer ? Number(otherCharges.toll.amount) : 0,
      },
      parking: {
        amount: Number(otherCharges.parking.amount),
        isChargeableToCustomer: otherCharges.parking.isChargeableToCustomer,
        expense: otherCharges.parking.isChargeableToCustomer ? 0 : Number(otherCharges.parking.amount),
        customerCharge: otherCharges.parking.isChargeableToCustomer ? Number(otherCharges.parking.amount) : 0,
      },
      nightHalt: {
        amount: Number(otherCharges.nightHalt.amount),
        isChargeableToCustomer: otherCharges.nightHalt.isChargeableToCustomer,
        expense: otherCharges.nightHalt.isChargeableToCustomer ? 0 : Number(otherCharges.nightHalt.amount),
        customerCharge: otherCharges.nightHalt.isChargeableToCustomer ? Number(otherCharges.nightHalt.amount) : 0,
      },
      driverAllowance: {
        amount: Number(otherCharges.driverAllowance.amount),
        isChargeableToCustomer: otherCharges.driverAllowance.isChargeableToCustomer,
        expense: otherCharges.driverAllowance.isChargeableToCustomer ? 0 : Number(otherCharges.driverAllowance.amount),
        customerCharge: otherCharges.driverAllowance.isChargeableToCustomer ? Number(otherCharges.driverAllowance.amount) : 0,
      },
      totalExpense: calculateOtherChargesExpenses(),
      totalCustomerCharge: calculateOtherChargesForCustomer(),
    }

    return {
      customerPackageBreakdown,
      supplierExpenseBreakdown,
      otherChargesBreakdown,
      requestTotal: regularRequest.requestTotal,
      requestExpense: regularRequest.requestExpense,
      requestProfit: regularRequest.requestProfit,
      customerBill: regularRequest.customerBill,
    }
  }

  // Auto-calculate totalKm when openingKm or closingKm changes
  useEffect(() => {
    const { openingKm, closingKm } = regularRequest.requestDetails
    const totalKm = closingKm && openingKm ? closingKm - openingKm : 0

    setRegularRequest(prev => ({
      ...prev,
      requestDetails: {
        ...prev.requestDetails,
        totalKm: totalKm > 0 ? totalKm : null,
      },
    }))
  }, [regularRequest.requestDetails.openingKm, regularRequest.requestDetails.closingKm])

  // Auto-calculate totalHr when pickUpDateTime or dropDateTime changes
  useEffect(() => {
    const { pickUpDateTime, dropDateTime } = regularRequest.requestDetails
    const totalHr = pickUpDateTime && dropDateTime ? (new Date(dropDateTime).getTime() - new Date(pickUpDateTime).getTime()) / (1000 * 60 * 60) : 0

    setRegularRequest(prev => ({
      ...prev,
      requestDetails: {
        ...prev.requestDetails,
        totalHr: totalHr > 0 ? totalHr : null,
      },
    }))
  }, [regularRequest.requestDetails.pickUpDateTime, regularRequest.requestDetails.dropDateTime])

  // Handle package API response
  useEffect(() => {
    if (packagesIsError) {
      const errorMessage = 'Unable to load package information. Please check your connection and try again.'
      setApiErrors(prev => ({
        ...prev,
        packages: errorMessage,
      }))
      setPackageOptions([])
      showToast(errorMessage, 'error')
    } else if (packages?.data?.length > 0) {
      const options = packages.data.map((pkg: { _id: any; packageCode: any }) => ({
        key: pkg._id,
        value: pkg.packageCode,
      }))
      setPackageOptions(options)
      setApiErrors(prev => ({
        ...prev,
        packages: '',
      }))
    } else {
      setPackageOptions([])
      setApiErrors(prev => ({
        ...prev,
        packages: '',
      }))
    }
  }, [packages, packagesError, packagesIsError])

  // Handle customer API response
  useEffect(() => {
    if (customersIsError) {
      const errorMessage = 'Unable to load customer data. Please check your connection and try again.'
      setApiErrors(prev => ({
        ...prev,
        customers: errorMessage,
      }))
      setCustomerOptions([])
      showToast(errorMessage, 'error')
    } else if (customers?.data?.length > 0) {
      const options = customers.data.map((customer: { _id: any; name: any }) => ({
        key: customer._id,
        value: customer.name,
      }))
      setCustomerOptions(options)
      setApiErrors(prev => ({
        ...prev,
        customers: '',
      }))
    } else {
      setCustomerOptions([])
      setApiErrors(prev => ({
        ...prev,
        customers: '',
      }))
    }
  }, [customers, customersError, customersIsError])

  // Handle supplier vehicles API response
  useEffect(() => {
    if (!isSupplierVehicle || !regularRequest.vehicleDetails.supplierDetails.supplier) {
      setSupplierVehicleOptions([])
      setVehicleOptions([])
      setApiErrors(prev => ({ ...prev, vehicles: '' }))
      return
    }

    if (supplierVehiclesIsError) {
      const errorMessage = 'Unable to load supplier vehicle data. Please check your connection and try again.'
      setApiErrors(prev => ({
        ...prev,
        vehicles: errorMessage,
      }))
      setSupplierVehicleOptions([])
      setVehicleOptions([])
      showToast(errorMessage, 'error')
    } else if (supplierVehicles?.data?.length > 0) {
      // Filter vehicles by selected supplier
      const filtered = supplierVehicles.data.filter(
        (vehicle: any) =>
          vehicle.supplier?._id === regularRequest.vehicleDetails.supplierDetails.supplier || vehicle.supplier === regularRequest.vehicleDetails.supplierDetails.supplier,
      )

      const options = filtered.map((vehicle: { _id: any; name: any }) => ({
        key: vehicle._id,
        value: vehicle.name,
      }))

      setSupplierVehicleOptions(options)
      setVehicleOptions(options)
      setApiErrors(prev => ({
        ...prev,
        vehicles: '',
      }))
    } else {
      setSupplierVehicleOptions([])
      setVehicleOptions([])
      setApiErrors(prev => ({
        ...prev,
        vehicles: '',
      }))
    }
  }, [isSupplierVehicle, regularRequest.vehicleDetails.supplierDetails.supplier, supplierVehicles, supplierVehiclesError, supplierVehiclesIsError])

  // Handle supplier API response
  useEffect(() => {
    if (!isSupplierVehicle) {
      setSupplierOptions([])
      setApiErrors(prev => ({ ...prev, suppliers: '' }))
      return
    }

    if (suppliersIsError) {
      const errorMessage = 'Unable to load supplier data. Please check your connection and try again.'
      setApiErrors(prev => ({
        ...prev,
        suppliers: errorMessage,
      }))
      setSupplierOptions([])
      showToast(errorMessage, 'error')
    } else if (suppliers?.data?.length > 0) {
      const options = suppliers.data.map((supplier: { _id: any; companyName: any }) => ({
        key: supplier._id,
        value: supplier.companyName,
      }))
      setSupplierOptions(options)
      setApiErrors(prev => ({
        ...prev,
        suppliers: '',
      }))
    } else {
      setSupplierOptions([])
      setApiErrors(prev => ({
        ...prev,
        suppliers: '',
      }))
    }
  }, [isSupplierVehicle, suppliers, suppliersError, suppliersIsError])

  // Handle supplier package API response
  useEffect(() => {
    if (!isSupplierVehicle || !regularRequest.vehicleDetails.supplierDetails.supplier) {
      setSupplierPackageOptions([])
      setApiErrors(prev => ({ ...prev, supplierPackages: '' }))
      return
    }

    if (supplierPackagesIsError) {
      const errorMessage = 'Unable to load supplier package data. Please check your connection and try again.'
      setApiErrors(prev => ({
        ...prev,
        supplierPackages: errorMessage,
      }))
      setSupplierPackageOptions([])
      showToast(errorMessage, 'error')
    } else if (supplierPackages?.data?.length > 0) {
      const options = supplierPackages.data.map((pkg: { _id: any; packageCode: any }) => ({
        key: pkg._id,
        value: pkg.packageCode,
      }))
      setSupplierPackageOptions(options)
      setApiErrors(prev => ({ ...prev, supplierPackages: '' }))
    } else {
      setSupplierPackageOptions([])
      setApiErrors(prev => ({ ...prev, supplierPackages: '' }))
    }
  }, [isSupplierVehicle, regularRequest.vehicleDetails.supplierDetails.supplier, supplierPackages, supplierPackagesError, supplierPackagesIsError])

  // Handle staff API response
  useEffect(() => {
    if (staffIsError) {
      const errorMessage = 'Unable to load staff data. Please check your connection and try again.'
      setApiErrors(prev => ({
        ...prev,
        staff: errorMessage,
      }))
      setStaffOptions([])
      showToast(errorMessage, 'error')
    } else if (staff?.data?.length > 0) {
      const options = staff.data.map((staffMember: { _id: any; name: any }) => ({
        key: staffMember._id,
        value: staffMember.name,
      }))
      setStaffOptions(options)
      setApiErrors(prev => ({
        ...prev,
        staff: '',
      }))
    } else {
      setStaffOptions([])
      setApiErrors(prev => ({
        ...prev,
        staff: '',
      }))
    }
  }, [staff, staffError, staffIsError])

  // Load data when in edit mode
  useEffect(() => {
    if (isEditing && regularRequestData && !isLoadingRequest) {
      const transformedData = transformRegularRequestResponse(regularRequestData)
      setRegularRequest(transformedData)
    }
  }, [isEditing, regularRequestData, isLoadingRequest])

  // Handle error when fetching regular request data
  useEffect(() => {
    if (isEditing && regularRequestIsError) {
      const errorMessage = 'Unable to load regular request data. Please check your connection and try again.'
      showToast(errorMessage, 'error')
      // Navigate back to list after showing error
      setTimeout(() => {
        navigate('/requests/regular')
      }, 2000)
    }
  }, [isEditing, regularRequestIsError, showToast, navigate])

  const navigateBack = () => {
    navigate('/requests/regular')
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
    setValidationErrorType(!isValid ? 'submit' : null)
    setRegularRequestErrorMap(errorMap)

    if (isValid) {
      setIsValidationError(false)
      setValidationErrorType(null)

      try {
        if (isEditing) {
          await updateRegularRequestMutation.mutateAsync({ _id: id, ...regularRequest })
          showToast('Regular request updated successfully!', 'success')
        } else {
          await createRegularRequestMutation.mutateAsync(regularRequest)
          showToast('New regular request created successfully!', 'success')
        }
        navigateBack()
      } catch (error) {
        console.log('Unable to submit regular request', error)
        showToast(`Unable to ${isEditing ? 'update' : 'create'} regular request. Please try again.`, 'error')
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

        {/* Show loader when fetching data in edit mode */}
        {isEditing && isLoadingRequest ? (
          <Loader type="form" />
        ) : (
          <>
            {isValidationError && (
              <Alert
                type="error"
                message={
                  validationErrorType === 'calculate'
                    ? 'Please fill in all required fields to calculate profit (pickup/drop times, opening/closing km, and package details).'
                    : 'Please review and correct the errors indicated below before submitting.'
                }
                className={bemClass([blk, 'margin-bottom'])}
              />
            )}
            {(apiErrors.packages || apiErrors.customers || apiErrors.vehicles || apiErrors.suppliers || apiErrors.supplierPackages || apiErrors.staff) && (
              <Alert
                type="error"
                message={`Some data could not be loaded: ${[apiErrors.packages, apiErrors.customers, apiErrors.vehicles, apiErrors.suppliers, apiErrors.supplierPackages, apiErrors.staff].filter(Boolean).join(', ')}`}
                className={bemClass([blk, 'margin-bottom'])}
              />
            )}

            <div className={bemClass([blk, 'content'])}>
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
                      value={regularRequest.packageDetails.packageCategory}
                      changeHandler={value => {
                        const updatedData = {
                          ...regularRequest,
                          packageDetails: {
                            ...regularRequest.packageDetails,
                            packageCategory: value.packageCategory?.toString() ?? '',
                            package: '', // Reset package when category changes
                          },
                        }
                        setRegularRequest(updatedData)
                      }}
                      required
                      errorMessage={regularRequestErrorMap['packageDetails.packageCategory']}
                      invalid={!!regularRequestErrorMap['packageDetails.packageCategory']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Package"
                      name="package"
                      options={
                        packagesLoading
                          ? [{ key: 'loading', value: 'Please wait...' }]
                          : packagesIsError
                            ? [{ key: 'error', value: 'Unable to load options' }]
                            : packageOptions.length > 0
                              ? packageOptions
                              : [{ key: 'no-data', value: 'No packages found' }]
                      }
                      value={
                        regularRequest.packageDetails.package
                          ? typeof regularRequest.packageDetails.package === 'string'
                            ? ((packageOptions.find((option: any) => option.key === regularRequest.packageDetails.package) as any)?.value ?? '')
                            : ((packageOptions.find((option: any) => option.key === (regularRequest.packageDetails.package as any)._id) as any)?.value ?? '')
                          : ''
                      }
                      changeHandler={value => {
                        const selectedOption = packageOptions.find((option: any) => option.value === value.package) as any
                        if (!selectedOption || ['Please wait...', 'Unable to load options', 'No packages found'].includes(selectedOption.value)) {
                          return
                        }
                        const updatedData = {
                          ...regularRequest,
                          packageDetails: {
                            ...regularRequest.packageDetails,
                            package: selectedOption.key,
                          },
                        }
                        setRegularRequest(updatedData)
                      }}
                      required
                      errorMessage={regularRequestErrorMap['packageDetails.package']}
                      invalid={!!regularRequestErrorMap['packageDetails.package']}
                      disabled={!regularRequest.packageDetails.packageCategory}
                    />
                  </Column>
                </Row>
              </Panel>

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
                    <ConfiguredInput
                      label="Request Type"
                      name="requestType"
                      configToUse="Request type"
                      type={CONFIGURED_INPUT_TYPES.SELECT}
                      value={regularRequest.requestDetails.requestType}
                      changeHandler={value => {
                        const updatedData = {
                          ...regularRequest,
                          requestDetails: {
                            ...regularRequest.requestDetails,
                            requestType: value.requestType?.toString() ?? '',
                          },
                        }
                        setRegularRequest(updatedData)
                      }}
                      required
                      errorMessage={regularRequestErrorMap['requestDetails.requestType']}
                      invalid={!!regularRequestErrorMap['requestDetails.requestType']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Pickup Location"
                      name="pickUpLocation"
                      value={regularRequest.requestDetails.pickUpLocation}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          requestDetails: {
                            ...regularRequest.requestDetails,
                            pickUpLocation: value.pickUpLocation?.toString() ?? '',
                          },
                        })
                      }}
                      required
                      errorMessage={regularRequestErrorMap['requestDetails.pickUpLocation']}
                      invalid={!!regularRequestErrorMap['requestDetails.pickUpLocation']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Drop Location"
                      name="dropOffLocation"
                      value={regularRequest.requestDetails.dropOffLocation}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          requestDetails: {
                            ...regularRequest.requestDetails,
                            dropOffLocation: value.dropOffLocation?.toString() ?? '',
                          },
                        })
                      }}
                      required
                      errorMessage={regularRequestErrorMap['requestDetails.dropOffLocation']}
                      invalid={!!regularRequestErrorMap['requestDetails.dropOffLocation']}
                    />
                  </Column>
                </Row>
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <DateTimeInput
                      label="Pickup Date and Time"
                      name="pickUpDateTime"
                      type="datetime-local"
                      value={regularRequest.requestDetails.pickUpDateTime}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          requestDetails: {
                            ...regularRequest.requestDetails,
                            pickUpDateTime: value.pickUpDateTime,
                          },
                        })
                      }}
                      required
                      errorMessage={regularRequestErrorMap['requestDetails.pickUpDateTime']}
                      invalid={!!regularRequestErrorMap['requestDetails.pickUpDateTime']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <DateTimeInput
                      label="Drop Date and Time"
                      name="dropDateTime"
                      type="datetime-local"
                      value={regularRequest.requestDetails.dropDateTime}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          requestDetails: {
                            ...regularRequest.requestDetails,
                            dropDateTime: value.dropDateTime,
                          },
                        })
                      }}
                      required
                      disabled={!regularRequest.requestDetails.pickUpDateTime}
                      min={regularRequest.requestDetails.pickUpDateTime || undefined}
                      errorMessage={regularRequestErrorMap['requestDetails.dropDateTime']}
                      invalid={!!regularRequestErrorMap['requestDetails.dropDateTime']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'read-only'])}
                  >
                    <ReadOnlyText
                      label="Duration"
                      value={regularRequest.requestDetails.totalHr ? regularRequest.requestDetails.totalHr + ' Hours' : '-'}
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
                    <NumberInput
                      label="Opening Km"
                      name="openingKm"
                      value={regularRequest.requestDetails.openingKm ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          requestDetails: {
                            ...regularRequest.requestDetails,
                            openingKm: value.openingKm ?? null,
                          },
                        })
                      }}
                      min={0}
                      required
                      errorMessage={regularRequestErrorMap['requestDetails.openingKm']}
                      invalid={!!regularRequestErrorMap['requestDetails.openingKm']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <NumberInput
                      label="Closing Km"
                      name="closingKm"
                      value={regularRequest.requestDetails.closingKm ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          requestDetails: {
                            ...regularRequest.requestDetails,
                            closingKm: value.closingKm ?? null,
                          },
                        })
                      }}
                      min={regularRequest.requestDetails.openingKm || 0}
                      required
                      errorMessage={regularRequestErrorMap['requestDetails.closingKm']}
                      invalid={!!regularRequestErrorMap['requestDetails.closingKm']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'read-only'])}
                  >
                    <ReadOnlyText
                      label="Total Distance"
                      value={regularRequest.requestDetails.totalKm ? `${regularRequest.requestDetails.totalKm} km` : '-'}
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
                      value={regularRequest.requestDetails.ac ? 'Yes' : 'No'}
                      changeHandler={value => {
                        const updatedData = {
                          ...regularRequest,
                          requestDetails: {
                            ...regularRequest.requestDetails,
                            ac: value.ac === 'Yes',
                          },
                        }
                        setRegularRequest(updatedData)
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
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Customer Type"
                      name="customerType"
                      options={[
                        { key: 'existing', value: 'Existing' },
                        { key: 'new', value: 'New' },
                      ]}
                      value={regularRequest.customerDetails.customerType === 'existing' ? 'Existing' : 'New'}
                      changeHandler={value => {
                        const selectedType = value.customerType === 'Existing' ? 'existing' : 'new'
                        const updatedData = {
                          ...regularRequest,
                          customerDetails: {
                            ...regularRequest.customerDetails,
                            customerType: selectedType as 'existing' | 'new',
                            customerCategory: selectedType === 'new' ? null : regularRequest.customerDetails.customerCategory,
                            customer: selectedType === 'new' ? null : regularRequest.customerDetails.customer,
                            newCustomerDetails: selectedType === 'existing' ? null : { name: '', contact: '', email: '' },
                          },
                        }
                        setRegularRequest(updatedData)
                      }}
                      showPlaceholder={false}
                      required
                      errorMessage={regularRequestErrorMap['customerDetails.customerType']}
                      invalid={!!regularRequestErrorMap['customerDetails.customerType']}
                    />
                  </Column>
                </Row>
                {regularRequest.customerDetails.customerType === 'existing' ? (
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
                        value={regularRequest.customerDetails.customerCategory || ''}
                        changeHandler={value => {
                          const updatedData = {
                            ...regularRequest,
                            customerDetails: {
                              ...regularRequest.customerDetails,
                              customerCategory: value.customerCategory?.toString() ?? '',
                              customer: null,
                            },
                          }
                          setRegularRequest(updatedData)
                        }}
                        required
                        errorMessage={regularRequestErrorMap['customerDetails.customerCategory']}
                        invalid={!!regularRequestErrorMap['customerDetails.customerCategory']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <SelectInput
                        label="Customer"
                        name="customer"
                        options={
                          customersLoading
                            ? [{ key: 'loading', value: 'Please wait...' }]
                            : customersIsError
                              ? [{ key: 'error', value: 'Unable to load options' }]
                              : customerOptions.length > 0
                                ? customerOptions
                                : [{ key: 'no-data', value: 'No customers found' }]
                        }
                        value={
                          regularRequest.customerDetails.customer
                            ? typeof regularRequest.customerDetails.customer === 'string'
                              ? ((customerOptions.find((option: any) => option.key === regularRequest.customerDetails.customer) as any)?.value ?? '')
                              : ((customerOptions.find((option: any) => option.key === (regularRequest.customerDetails.customer as any)._id) as any)?.value ?? '')
                            : ''
                        }
                        changeHandler={value => {
                          const selectedOption = customerOptions.find((option: any) => option.value === value.customer) as any
                          if (!selectedOption || ['Please wait...', 'Unable to load options', 'No customers found'].includes(value.customer as string)) {
                            return
                          }
                          const updatedData = {
                            ...regularRequest,
                            customerDetails: {
                              ...regularRequest.customerDetails,
                              customer: selectedOption.key,
                            },
                          }
                          setRegularRequest(updatedData)
                        }}
                        required
                        errorMessage={regularRequestErrorMap['customerDetails.customer']}
                        invalid={!!regularRequestErrorMap['customerDetails.customer']}
                        disabled={!regularRequest.customerDetails.customerCategory}
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
                        value={regularRequest.customerDetails.newCustomerDetails?.name || ''}
                        changeHandler={value => {
                          setRegularRequest({
                            ...regularRequest,
                            customerDetails: {
                              ...regularRequest.customerDetails,
                              newCustomerDetails: {
                                ...regularRequest.customerDetails.newCustomerDetails!,
                                name: value.customerName?.toString() ?? '',
                              },
                            },
                          })
                        }}
                        required
                        errorMessage={regularRequestErrorMap['customerDetails.newCustomerDetails.name']}
                        invalid={!!regularRequestErrorMap['customerDetails.newCustomerDetails.name']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Customer Contact"
                        name="customerContact"
                        value={regularRequest.customerDetails.newCustomerDetails?.contact || ''}
                        changeHandler={value => {
                          setRegularRequest({
                            ...regularRequest,
                            customerDetails: {
                              ...regularRequest.customerDetails,
                              newCustomerDetails: {
                                ...regularRequest.customerDetails.newCustomerDetails!,
                                contact: value.customerContact?.toString() ?? '',
                              },
                            },
                          })
                        }}
                        required
                        errorMessage={regularRequestErrorMap['customerDetails.newCustomerDetails.contact']}
                        invalid={!!regularRequestErrorMap['customerDetails.newCustomerDetails.contact']}
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
                        value={regularRequest.customerDetails.newCustomerDetails?.email || ''}
                        changeHandler={value => {
                          setRegularRequest({
                            ...regularRequest,
                            customerDetails: {
                              ...regularRequest.customerDetails,
                              newCustomerDetails: {
                                ...regularRequest.customerDetails.newCustomerDetails!,
                                email: value.customerEmail?.toString() ?? '',
                              },
                            },
                          })
                        }}
                        errorMessage={regularRequestErrorMap['customerDetails.newCustomerDetails.email']}
                        invalid={!!regularRequestErrorMap['customerDetails.newCustomerDetails.email']}
                      />
                    </Column>
                  </Row>
                )}
              </Panel>

              {/* Vehicle Details Panel - Start adding state management and validation from here */}
              <Panel
                title="Vehicle Details"
                className={bemClass([blk, 'margin-bottom'])}
              >
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Vehicle Type"
                      name="vehicleType"
                      options={[
                        { key: 'existing', value: 'Existing' },
                        { key: 'new', value: 'New' },
                      ]}
                      value={regularRequest.vehicleDetails.vehicleType === 'existing' ? 'Existing' : 'New'}
                      changeHandler={value => {
                        const selectedType = value.vehicleType === 'Existing' ? 'existing' : 'new'
                        const updatedData = {
                          ...regularRequest,
                          vehicleDetails: {
                            ...regularRequest.vehicleDetails,
                            vehicleType: selectedType as 'existing' | 'new',
                            vehicleCategory: selectedType === 'new' ? null : regularRequest.vehicleDetails.vehicleCategory,
                            vehicle: selectedType === 'new' ? null : regularRequest.vehicleDetails.vehicle,
                            supplierDetails: selectedType === 'new' ? { supplier: null, package: null } : regularRequest.vehicleDetails.supplierDetails,
                            newVehicleDetails:
                              selectedType === 'existing'
                                ? null
                                : {
                                    ownerName: '',
                                    ownerContact: '',
                                    ownerEmail: '',
                                    manufacturer: '',
                                    name: '',
                                    registrationNo: '',
                                  },
                          },
                        }
                        setRegularRequest(updatedData)
                      }}
                      showPlaceholder={false}
                      required
                      errorMessage={regularRequestErrorMap['vehicleDetails.vehicleType']}
                      invalid={!!regularRequestErrorMap['vehicleDetails.vehicleType']}
                    />
                  </Column>
                </Row>
                {regularRequest.vehicleDetails.vehicleType === 'existing' ? (
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
                          value={regularRequest.vehicleDetails.vehicleCategory || ''}
                          changeHandler={value => {
                            const updatedData = {
                              ...regularRequest,
                              vehicleDetails: {
                                ...regularRequest.vehicleDetails,
                                vehicleCategory: value.vehicleCategory?.toString() ?? '',
                                vehicle: null,
                                supplierDetails: { supplier: null, package: null },
                              },
                            }
                            setRegularRequest(updatedData)
                            setSupplierPackageOptions([]) // Clear supplier package options
                          }}
                          required
                          errorMessage={regularRequestErrorMap['vehicleDetails.vehicleCategory']}
                          invalid={!!regularRequestErrorMap['vehicleDetails.vehicleCategory']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <SelectInput
                          label="Vehicle"
                          name="vehicle"
                          options={
                            vehiclesLoading || (isSupplierVehicle && supplierVehiclesLoading)
                              ? [{ key: 'loading', value: 'Please wait...' }]
                              : vehiclesIsError || (isSupplierVehicle && supplierVehiclesIsError)
                                ? [{ key: 'error', value: 'Unable to load options' }]
                                : vehicleOptions.length > 0
                                  ? vehicleOptions
                                  : [{ key: 'no-data', value: 'No vehicles found' }]
                          }
                          value={
                            regularRequest.vehicleDetails.vehicle
                              ? typeof regularRequest.vehicleDetails.vehicle === 'string'
                                ? ((vehicleOptions.find((option: any) => option.key === regularRequest.vehicleDetails.vehicle) as any)?.value ?? '')
                                : ((vehicleOptions.find((option: any) => option.key === (regularRequest.vehicleDetails.vehicle as any)._id) as any)?.value ?? '')
                              : ''
                          }
                          changeHandler={value => {
                            const selectedOption = vehicleOptions.find((option: any) => option.value === value.vehicle) as any
                            if (!selectedOption || ['Please wait...', 'Unable to load options', 'No vehicles found'].includes(value.vehicle as string)) {
                              return
                            }
                            const updatedData = {
                              ...regularRequest,
                              vehicleDetails: {
                                ...regularRequest.vehicleDetails,
                                vehicle: selectedOption.key,
                              },
                            }
                            setRegularRequest(updatedData)
                          }}
                          required
                          errorMessage={regularRequestErrorMap['vehicleDetails.vehicle']}
                          invalid={!!regularRequestErrorMap['vehicleDetails.vehicle']}
                          disabled={!regularRequest.vehicleDetails.vehicleCategory || (isSupplierVehicle && !regularRequest.vehicleDetails.supplierDetails.supplier) || false}
                        />
                      </Column>
                    </Row>
                    {isSupplierVehicle && (
                      <Row>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <SelectInput
                            label="Supplier"
                            name="supplier"
                            options={
                              !isSupplierVehicle
                                ? [{ key: 'empty', value: 'Select vehicle category first' }]
                                : suppliersLoading
                                  ? [{ key: 'loading', value: 'Please wait...' }]
                                  : suppliersIsError
                                    ? [{ key: 'error', value: 'Unable to load options' }]
                                    : supplierOptions.length > 0
                                      ? supplierOptions
                                      : [{ key: 'no-data', value: 'No suppliers found' }]
                            }
                            value={
                              regularRequest.vehicleDetails.supplierDetails.supplier
                                ? typeof regularRequest.vehicleDetails.supplierDetails.supplier === 'string'
                                  ? ((supplierOptions.find((option: any) => option.key === regularRequest.vehicleDetails.supplierDetails.supplier) as any)?.value ?? '')
                                  : ((supplierOptions.find((option: any) => option.key === (regularRequest.vehicleDetails.supplierDetails.supplier as any)._id) as any)?.value ??
                                    '')
                                : ''
                            }
                            changeHandler={value => {
                              const selectedOption = supplierOptions.find((option: any) => option.value === value.supplier) as any
                              if (
                                !selectedOption ||
                                ['Select vehicle category first', 'Please wait...', 'Unable to load options', 'No suppliers found'].includes(value.supplier as string)
                              ) {
                                return
                              }
                              const updatedData = {
                                ...regularRequest,
                                vehicleDetails: {
                                  ...regularRequest.vehicleDetails,
                                  supplierDetails: {
                                    supplier: selectedOption.key,
                                    package: null, // Reset package when supplier changes
                                  },
                                },
                              }
                              setRegularRequest(updatedData)
                            }}
                            required
                            errorMessage={regularRequestErrorMap['vehicleDetails.supplierDetails.supplier']}
                            invalid={!!regularRequestErrorMap['vehicleDetails.supplierDetails.supplier']}
                          />
                        </Column>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <SelectInput
                            label="Supplier Package"
                            name="supplierPackage"
                            options={
                              !regularRequest.vehicleDetails.supplierDetails.supplier
                                ? [{ key: 'empty', value: 'Select supplier first' }]
                                : supplierPackagesLoading
                                  ? [{ key: 'loading', value: 'Please wait...' }]
                                  : apiErrors.supplierPackages
                                    ? [{ key: 'error', value: 'Unable to load options' }]
                                    : supplierPackageOptions.length > 0
                                      ? supplierPackageOptions
                                      : [{ key: 'no-data', value: 'No packages found' }]
                            }
                            value={
                              regularRequest.vehicleDetails.supplierDetails.package
                                ? typeof regularRequest.vehicleDetails.supplierDetails.package === 'string'
                                  ? ((supplierPackageOptions.find((option: any) => option.key === regularRequest.vehicleDetails.supplierDetails.package) as any)?.value ?? '')
                                  : ((supplierPackageOptions.find((option: any) => option.key === (regularRequest.vehicleDetails.supplierDetails.package as any)._id) as any)
                                      ?.value ?? '')
                                : ''
                            }
                            changeHandler={value => {
                              const selectedOption = supplierPackageOptions.find((option: any) => option.value === value.supplierPackage) as any
                              if (
                                !selectedOption ||
                                ['Select supplier first', 'Please wait...', 'Unable to load options', 'No packages found'].includes(value.supplierPackage as string)
                              ) {
                                return
                              }
                              const updatedData = {
                                ...regularRequest,
                                vehicleDetails: {
                                  ...regularRequest.vehicleDetails,
                                  supplierDetails: {
                                    ...regularRequest.vehicleDetails.supplierDetails,
                                    package: selectedOption.key,
                                  },
                                },
                              }
                              setRegularRequest(updatedData)
                            }}
                            required
                            errorMessage={regularRequestErrorMap['vehicleDetails.supplierDetails.package']}
                            invalid={!!regularRequestErrorMap['vehicleDetails.supplierDetails.package']}
                            disabled={!regularRequest.vehicleDetails.supplierDetails.supplier}
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
                          value={regularRequest.vehicleDetails.newVehicleDetails?.ownerName || ''}
                          changeHandler={value => {
                            setRegularRequest({
                              ...regularRequest,
                              vehicleDetails: {
                                ...regularRequest.vehicleDetails,
                                newVehicleDetails: {
                                  ...regularRequest.vehicleDetails.newVehicleDetails!,
                                  ownerName: value.ownerName?.toString() ?? '',
                                },
                              },
                            })
                          }}
                          required
                          errorMessage={regularRequestErrorMap['vehicleDetails.newVehicleDetails.ownerName']}
                          invalid={!!regularRequestErrorMap['vehicleDetails.newVehicleDetails.ownerName']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Owner Contact"
                          name="ownerContact"
                          value={regularRequest.vehicleDetails.newVehicleDetails?.ownerContact || ''}
                          changeHandler={value => {
                            setRegularRequest({
                              ...regularRequest,
                              vehicleDetails: {
                                ...regularRequest.vehicleDetails,
                                newVehicleDetails: {
                                  ...regularRequest.vehicleDetails.newVehicleDetails!,
                                  ownerContact: value.ownerContact?.toString() ?? '',
                                },
                              },
                            })
                          }}
                          required
                          errorMessage={regularRequestErrorMap['vehicleDetails.newVehicleDetails.ownerContact']}
                          invalid={!!regularRequestErrorMap['vehicleDetails.newVehicleDetails.ownerContact']}
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
                          value={regularRequest.vehicleDetails.newVehicleDetails?.ownerEmail || ''}
                          changeHandler={value => {
                            setRegularRequest({
                              ...regularRequest,
                              vehicleDetails: {
                                ...regularRequest.vehicleDetails,
                                newVehicleDetails: {
                                  ...regularRequest.vehicleDetails.newVehicleDetails!,
                                  ownerEmail: value.ownerEmail?.toString() ?? '',
                                },
                              },
                            })
                          }}
                          errorMessage={regularRequestErrorMap['vehicleDetails.newVehicleDetails.ownerEmail']}
                          invalid={!!regularRequestErrorMap['vehicleDetails.newVehicleDetails.ownerEmail']}
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
                          value={regularRequest.vehicleDetails.newVehicleDetails?.manufacturer || ''}
                          changeHandler={value => {
                            setRegularRequest({
                              ...regularRequest,
                              vehicleDetails: {
                                ...regularRequest.vehicleDetails,
                                newVehicleDetails: {
                                  ...regularRequest.vehicleDetails.newVehicleDetails!,
                                  manufacturer: value.manufacturer?.toString() ?? '',
                                },
                              },
                            })
                          }}
                          required
                          errorMessage={regularRequestErrorMap['vehicleDetails.newVehicleDetails.manufacturer']}
                          invalid={!!regularRequestErrorMap['vehicleDetails.newVehicleDetails.manufacturer']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Vehicle Name"
                          name="vehicleName"
                          value={regularRequest.vehicleDetails.newVehicleDetails?.name || ''}
                          changeHandler={value => {
                            setRegularRequest({
                              ...regularRequest,
                              vehicleDetails: {
                                ...regularRequest.vehicleDetails,
                                newVehicleDetails: {
                                  ...regularRequest.vehicleDetails.newVehicleDetails!,
                                  name: value.vehicleName?.toString() ?? '',
                                },
                              },
                            })
                          }}
                          required
                          errorMessage={regularRequestErrorMap['vehicleDetails.newVehicleDetails.name']}
                          invalid={!!regularRequestErrorMap['vehicleDetails.newVehicleDetails.name']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Registration No"
                          name="registrationNo"
                          value={regularRequest.vehicleDetails.newVehicleDetails?.registrationNo || ''}
                          changeHandler={value => {
                            setRegularRequest({
                              ...regularRequest,
                              vehicleDetails: {
                                ...regularRequest.vehicleDetails,
                                newVehicleDetails: {
                                  ...regularRequest.vehicleDetails.newVehicleDetails!,
                                  registrationNo: (value.registrationNo?.toString() ?? '').toUpperCase(),
                                },
                              },
                            })
                          }}
                          required
                          errorMessage={regularRequestErrorMap['vehicleDetails.newVehicleDetails.registrationNo']}
                          invalid={!!regularRequestErrorMap['vehicleDetails.newVehicleDetails.registrationNo']}
                        />
                      </Column>
                    </Row>
                  </>
                )}
              </Panel>

              {/* Staff Details Panel */}
              <Panel
                title="Staff Details"
                className={bemClass([blk, 'margin-bottom'])}
              >
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Staff Type"
                      name="staffType"
                      options={[
                        { key: 'existing', value: 'Existing' },
                        { key: 'new', value: 'New' },
                      ]}
                      value={regularRequest.staffDetails.staffType === 'existing' ? 'Existing' : 'New'}
                      changeHandler={value => {
                        const selectedType = value.staffType === 'Existing' ? 'existing' : 'new'
                        const updatedData = {
                          ...regularRequest,
                          staffDetails: {
                            ...regularRequest.staffDetails,
                            staffType: selectedType as 'existing' | 'new',
                            staffCategory: selectedType === 'new' ? null : regularRequest.staffDetails.staffCategory,
                            staff: selectedType === 'new' ? null : regularRequest.staffDetails.staff,
                            newStaffDetails: selectedType === 'existing' ? null : { name: '', contact: '', license: '' },
                          },
                        }
                        setRegularRequest(updatedData)
                      }}
                      showPlaceholder={false}
                      required
                      errorMessage={regularRequestErrorMap['staffDetails.staffType']}
                      invalid={!!regularRequestErrorMap['staffDetails.staffType']}
                    />
                  </Column>
                </Row>
                {regularRequest.staffDetails.staffType === 'existing' ? (
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
                        value={regularRequest.staffDetails.staffCategory || ''}
                        changeHandler={value => {
                          const updatedData = {
                            ...regularRequest,
                            staffDetails: {
                              ...regularRequest.staffDetails,
                              staffCategory: value.staffCategory?.toString() ?? '',
                              staff: null,
                            },
                          }
                          setRegularRequest(updatedData)
                        }}
                        required
                        errorMessage={regularRequestErrorMap['staffDetails.staffCategory']}
                        invalid={!!regularRequestErrorMap['staffDetails.staffCategory']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <SelectInput
                        label="Staff"
                        name="staff"
                        options={
                          staffLoading
                            ? [{ key: 'loading', value: 'Please wait...' }]
                            : staffIsError
                              ? [{ key: 'error', value: 'Unable to load options' }]
                              : staffOptions.length > 0
                                ? staffOptions
                                : [{ key: 'no-data', value: 'No staff found' }]
                        }
                        value={
                          regularRequest.staffDetails.staff
                            ? typeof regularRequest.staffDetails.staff === 'string'
                              ? ((staffOptions.find((option: any) => option.key === regularRequest.staffDetails.staff) as any)?.value ?? '')
                              : ((staffOptions.find((option: any) => option.key === (regularRequest.staffDetails.staff as any)._id) as any)?.value ?? '')
                            : ''
                        }
                        changeHandler={value => {
                          const selectedOption = staffOptions.find((option: any) => option.value === value.staff) as any
                          if (!selectedOption || ['Please wait...', 'Unable to load options', 'No staff found'].includes(value.staff as string)) {
                            return
                          }
                          const updatedData = {
                            ...regularRequest,
                            staffDetails: {
                              ...regularRequest.staffDetails,
                              staff: selectedOption.key,
                            },
                          }
                          setRegularRequest(updatedData)
                        }}
                        required
                        errorMessage={regularRequestErrorMap['staffDetails.staff']}
                        invalid={!!regularRequestErrorMap['staffDetails.staff']}
                        disabled={!regularRequest.staffDetails.staffCategory}
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
                        value={regularRequest.staffDetails.newStaffDetails?.name || ''}
                        changeHandler={value => {
                          setRegularRequest({
                            ...regularRequest,
                            staffDetails: {
                              ...regularRequest.staffDetails,
                              newStaffDetails: {
                                ...regularRequest.staffDetails.newStaffDetails!,
                                name: value.staffName?.toString() ?? '',
                              },
                            },
                          })
                        }}
                        required
                        errorMessage={regularRequestErrorMap['staffDetails.newStaffDetails.name']}
                        invalid={!!regularRequestErrorMap['staffDetails.newStaffDetails.name']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="Staff Contact"
                        name="staffContact"
                        value={regularRequest.staffDetails.newStaffDetails?.contact || ''}
                        changeHandler={value => {
                          setRegularRequest({
                            ...regularRequest,
                            staffDetails: {
                              ...regularRequest.staffDetails,
                              newStaffDetails: {
                                ...regularRequest.staffDetails.newStaffDetails!,
                                contact: value.staffContact?.toString() ?? '',
                              },
                            },
                          })
                        }}
                        required
                        errorMessage={regularRequestErrorMap['staffDetails.newStaffDetails.contact']}
                        invalid={!!regularRequestErrorMap['staffDetails.newStaffDetails.contact']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <TextInput
                        label="License Number"
                        name="staffLicense"
                        value={regularRequest.staffDetails.newStaffDetails?.license || ''}
                        changeHandler={value => {
                          setRegularRequest({
                            ...regularRequest,
                            staffDetails: {
                              ...regularRequest.staffDetails,
                              newStaffDetails: {
                                ...regularRequest.staffDetails.newStaffDetails!,
                                license: value.staffLicense?.toString() ?? '',
                              },
                            },
                          })
                        }}
                        required
                        errorMessage={regularRequestErrorMap['staffDetails.newStaffDetails.license']}
                        invalid={!!regularRequestErrorMap['staffDetails.newStaffDetails.license']}
                      />
                    </Column>
                  </Row>
                )}
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
                    <NumberInput
                      name="tollAmount"
                      placeholder="Toll Amount"
                      value={regularRequest.otherCharges.toll.amount === 0 ? '' : regularRequest.otherCharges.toll.amount}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          otherCharges: {
                            ...regularRequest.otherCharges,
                            toll: {
                              ...regularRequest.otherCharges.toll,
                              amount: value.tollAmount || 0,
                            },
                          },
                        })
                      }}
                      min={0}
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
                    <NumberInput
                      name="parkingAmount"
                      placeholder="Parking Amount"
                      value={regularRequest.otherCharges.parking.amount === 0 ? '' : regularRequest.otherCharges.parking.amount}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          otherCharges: {
                            ...regularRequest.otherCharges,
                            parking: {
                              ...regularRequest.otherCharges.parking,
                              amount: value.parkingAmount || 0,
                            },
                          },
                        })
                      }}
                      min={0}
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
                    <NumberInput
                      name="nightHaltAmount"
                      placeholder="Night Halt Amount"
                      value={regularRequest.otherCharges.nightHalt.amount === 0 ? '' : regularRequest.otherCharges.nightHalt.amount}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          otherCharges: {
                            ...regularRequest.otherCharges,
                            nightHalt: {
                              ...regularRequest.otherCharges.nightHalt,
                              amount: value.nightHaltAmount || 0,
                            },
                          },
                        })
                      }}
                      min={0}
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
                    <NumberInput
                      name="driverAllowanceAmount"
                      placeholder="Driver Allowance Amount"
                      value={regularRequest.otherCharges.driverAllowance.amount === 0 ? '' : regularRequest.otherCharges.driverAllowance.amount}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          otherCharges: {
                            ...regularRequest.otherCharges,
                            driverAllowance: {
                              ...regularRequest.otherCharges.driverAllowance,
                              amount: value.driverAllowanceAmount || 0,
                            },
                          },
                        })
                      }}
                      min={0}
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

              {/* Status and Payment Details Panel */}
              <Panel
                title="Status and Payment Details"
                className={bemClass([blk, 'margin-bottom'])}
              >
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Status"
                      name="status"
                      options={[
                        { key: 'ONGOING', value: 'Ongoing' },
                        { key: 'PAYMENT_PENDING', value: 'Payment Pending' },
                        { key: 'CLOSED', value: 'Closed' },
                      ]}
                      value={regularRequest.status === 'ONGOING' ? 'Ongoing' : regularRequest.status === 'PAYMENT_PENDING' ? 'Payment Pending' : 'Closed'}
                      changeHandler={value => {
                        const statusMap: Record<string, 'ONGOING' | 'PAYMENT_PENDING' | 'CLOSED'> = {
                          Ongoing: 'ONGOING',
                          'Payment Pending': 'PAYMENT_PENDING',
                          Closed: 'CLOSED',
                        }
                        const updatedData = {
                          ...regularRequest,
                          status: statusMap[value.status] || 'ONGOING',
                        }
                        setRegularRequest(updatedData)
                      }}
                      showPlaceholder={false}
                      required
                      errorMessage={regularRequestErrorMap['status']}
                      invalid={!!regularRequestErrorMap['status']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <NumberInput
                      label="Amount Paid"
                      name="amountPaid"
                      placeholder="Enter amount paid"
                      value={regularRequest.paymentDetails.amountPaid === 0 ? '' : regularRequest.paymentDetails.amountPaid}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          paymentDetails: {
                            ...regularRequest.paymentDetails,
                            amountPaid: value.amountPaid || 0,
                          },
                        })
                      }}
                      min={0}
                      errorMessage={regularRequestErrorMap['paymentDetails.amountPaid']}
                      invalid={!!regularRequestErrorMap['paymentDetails.amountPaid']}
                    />
                  </Column>
                  {regularRequest.status === 'CLOSED' && (
                    <>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <ConfiguredInput
                          label="Payment Method"
                          name="paymentMethod"
                          configToUse="Payment method"
                          type={CONFIGURED_INPUT_TYPES.SELECT}
                          value={regularRequest.paymentDetails.paymentMethod || ''}
                          changeHandler={value => {
                            const updatedData = {
                              ...regularRequest,
                              paymentDetails: {
                                ...regularRequest.paymentDetails,
                                paymentMethod: typeof value.paymentMethod === 'string' ? value.paymentMethod : null,
                              },
                            }
                            setRegularRequest(updatedData)
                          }}
                          required
                          errorMessage={regularRequestErrorMap['paymentDetails.paymentMethod']}
                          invalid={!!regularRequestErrorMap['paymentDetails.paymentMethod']}
                        />
                      </Column>
                    </>
                  )}
                </Row>
                {regularRequest.status === 'CLOSED' && (
                  <Row>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <DateTimeInput
                        label="Payment Date"
                        name="paymentDate"
                        type="date"
                        value={regularRequest.paymentDetails.paymentDate}
                        changeHandler={value => {
                          setRegularRequest({
                            ...regularRequest,
                            paymentDetails: {
                              ...regularRequest.paymentDetails,
                              paymentDate: value.paymentDate,
                            },
                          })
                        }}
                        required
                        errorMessage={regularRequestErrorMap['paymentDetails.paymentDate']}
                        invalid={!!regularRequestErrorMap['paymentDetails.paymentDate']}
                      />
                    </Column>
                  </Row>
                )}
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
                <div className={bemClass([blk, 'action-items'])}>
                  <Button
                    size="medium"
                    category="primary"
                    clickHandler={calculateProfit}
                  >
                    Calculate
                  </Button>
                  <Button
                    size="medium"
                    category="primary"
                    clickHandler={viewCalculationBreakdown}
                    className={bemClass([blk, 'view-button'])}
                  >
                    View Breakdown
                  </Button>
                </div>
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
                      color="primary"
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
                      color="error"
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
                      color={regularRequest.requestProfit >= 0 ? 'success' : 'error'}
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
                  disabled={submitButtonLoading}
                >
                  Cancel
                </Button>
                <Button
                  size="medium"
                  category="primary"
                  clickHandler={submitHandler}
                  loading={submitButtonLoading}
                >
                  {isEditing ? 'Update' : 'Submit'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Calculation Breakdown Modal */}
      <Modal
        show={showCalculationModal}
        closeHandler={() => setShowCalculationModal(false)}
        title="Calculation Breakdown"
        size="large"
      >
        {(() => {
          const breakdown = getCalculationBreakdown()
          const { customerPackageBreakdown, supplierExpenseBreakdown, otherChargesBreakdown } = breakdown

          return (
            <div className={bemClass([blk, 'calculation-modal'])}>
              <div className={bemClass([blk, 'modal-body'])}>
                {/* Request Total Breakdown */}
                <div className={bemClass([blk, 'breakdown-section'])}>
                <Text
                  typography="m"
                  color="primary"
                  tag={'p'}
                  className={bemClass([blk, 'section-title'])}
                >
                  1. Request Total (Customer Package Billing)
                </Text>
                {customerPackageBreakdown ? (
                  <div className={bemClass([blk, 'breakdown-content'])}>
                    <div className={bemClass([blk, 'breakdown-row'])}>
                      <Text
                        typography="s"
                        color="gray-darker"
                      >
                        Base Amount
                      </Text>
                      <Text
                        typography="s"
                        color="gray-darker"
                      >{`₹${customerPackageBreakdown.baseAmount.toFixed(2)}`}</Text>
                    </div>
                    <div className={bemClass([blk, 'breakdown-divider'])} />

                    <div className={bemClass([blk, 'breakdown-subsection'])}>
                      <Text
                        typography="s"
                        color="gray-dark"
                      >
                        Distance Calculation:
                      </Text>
                      <div className={bemClass([blk, 'breakdown-detail'])}>
                        <Text
                          typography="s"
                          color="gray"
                        >{`Total KM: ${customerPackageBreakdown.totalKm.toFixed(2)} km`}</Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`Minimum KM: ${customerPackageBreakdown.minimumKm} km`}</Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`Extra KM: ${customerPackageBreakdown.extraKm.toFixed(2)} km`}</Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`Rate: ₹${customerPackageBreakdown.extraKmPerKmRate}/km`}</Text>
                      </div>
                      <div className={bemClass([blk, 'breakdown-row', ['highlight']])}>
                        <Text
                          typography="s"
                          color="gray-dark"
                        >
                          Extra KM Billing
                        </Text>
                        <Text
                          typography="s"
                          color="gray-dark"
                        >{`₹${customerPackageBreakdown.extraKmBilling.toFixed(2)}`}</Text>
                      </div>
                    </div>

                    <div className={bemClass([blk, 'breakdown-subsection'])}>
                      <Text
                        typography="s"
                        color="gray-dark"
                      >
                        Duration Calculation:
                      </Text>
                      <div className={bemClass([blk, 'breakdown-detail'])}>
                        <Text
                          typography="s"
                          color="gray"
                        >{`Total Hours: ${customerPackageBreakdown.totalHr.toFixed(2)} hrs`}</Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`Minimum Hours: ${customerPackageBreakdown.minimumHr} hrs`}</Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`Extra Hours: ${customerPackageBreakdown.extraHr.toFixed(2)} hrs`}</Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`Rate: ₹${customerPackageBreakdown.extraHrPerHrRate}/hr`}</Text>
                      </div>
                      <div className={bemClass([blk, 'breakdown-row', ['highlight']])}>
                        <Text
                          typography="s"
                          color="gray-dark"
                        >
                          Extra Hour Billing
                        </Text>
                        <Text
                          typography="s"
                          color="gray-dark"
                        >{`₹${customerPackageBreakdown.extraHrBilling.toFixed(2)}`}</Text>
                      </div>
                    </div>

                    <div className={bemClass([blk, 'breakdown-divider'])} />
                    <div className={bemClass([blk, 'breakdown-row', ['total']])}>
                      <Text
                        typography="m"
                        color="primary"
                      >
                        Request Total
                      </Text>
                      <Text
                        typography="m"
                        color="primary"
                      >{`₹${breakdown.requestTotal.toFixed(2)}`}</Text>
                    </div>
                  </div>
                ) : (
                  <Alert
                    type="info"
                    message="Customer package not selected"
                  />
                )}
              </div>

              {/* Request Expense Breakdown */}
              <div className={bemClass([blk, 'breakdown-section'])}>
                <Text
                  typography="m"
                  color="error"
                  tag={'p'}
                  className={bemClass([blk, 'section-title'])}
                >
                  2. Request Expense
                </Text>
                <div className={bemClass([blk, 'breakdown-content'])}>
                  {/* Supplier Vehicle Expense */}
                  {supplierExpenseBreakdown ? (
                    <>
                      <Text
                        typography="s"
                        color="gray-darker"
                        className={bemClass([blk, 'subsection-header'])}
                      >
                        Supplier Vehicle Expense
                      </Text>
                      <div className={bemClass([blk, 'breakdown-row'])}>
                        <Text
                          typography="s"
                          color="gray-darker"
                        >
                          Base Amount
                        </Text>
                        <Text
                          typography="s"
                          color="gray-darker"
                        >{`₹${supplierExpenseBreakdown.baseAmount.toFixed(2)}`}</Text>
                      </div>

                      <div className={bemClass([blk, 'breakdown-subsection'])}>
                        <Text
                          typography="s"
                          color="gray-dark"
                        >
                          Distance:
                        </Text>
                        <div className={bemClass([blk, 'breakdown-detail'])}>
                          <Text
                            typography="s"
                            color="gray"
                          >{`Extra KM: ${supplierExpenseBreakdown.extraKm.toFixed(2)} km × ₹${supplierExpenseBreakdown.extraKmPerKmRate}`}</Text>
                        </div>
                        <div className={bemClass([blk, 'breakdown-row', ['highlight']])}>
                          <Text
                            typography="s"
                            color="gray-dark"
                          >
                            Extra KM Expense
                          </Text>
                          <Text
                            typography="s"
                            color="gray-dark"
                          >{`₹${supplierExpenseBreakdown.extraKmExpense.toFixed(2)}`}</Text>
                        </div>
                      </div>

                      <div className={bemClass([blk, 'breakdown-subsection'])}>
                        <Text
                          typography="s"
                          color="gray-dark"
                        >
                          Duration:
                        </Text>
                        <div className={bemClass([blk, 'breakdown-detail'])}>
                          <Text
                            typography="s"
                            color="gray"
                          >{`Extra Hours: ${supplierExpenseBreakdown.extraHr.toFixed(2)} hrs × ₹${supplierExpenseBreakdown.extraHrPerHrRate}`}</Text>
                        </div>
                        <div className={bemClass([blk, 'breakdown-row', ['highlight']])}>
                          <Text
                            typography="s"
                            color="gray-dark"
                          >
                            Extra Hour Expense
                          </Text>
                          <Text
                            typography="s"
                            color="gray-dark"
                          >{`₹${supplierExpenseBreakdown.extraHrExpense.toFixed(2)}`}</Text>
                        </div>
                      </div>

                      <div className={bemClass([blk, 'breakdown-row', ['subtotal']])}>
                        <Text
                          typography="s"
                          color="gray-darker"
                        >
                          Supplier Vehicle Total
                        </Text>
                        <Text
                          typography="s"
                          color="gray-darker"
                        >{`₹${supplierExpenseBreakdown.total.toFixed(2)}`}</Text>
                      </div>
                      <div className={bemClass([blk, 'breakdown-divider'])} />
                    </>
                  ) : (
                    <>
                      <Text
                        typography="s"
                        color="gray"
                      >
                        No supplier vehicle expense
                      </Text>
                      <div className={bemClass([blk, 'breakdown-divider'])} />
                    </>
                  )}

                  {/* Other Charges Expense */}
                  <Text
                    typography="s"
                    color="gray-darker"
                    className={bemClass([blk, 'subsection-header'])}
                  >
                    Other Charges (Expenses)
                  </Text>
                  <div className={bemClass([blk, 'breakdown-detail'])}>
                    {otherChargesBreakdown.toll.expense > 0 && (
                      <div className={bemClass([blk, 'breakdown-row', ['small']])}>
                        <Text
                          typography="s"
                          color="gray"
                        >
                          Toll
                        </Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`₹${otherChargesBreakdown.toll.expense.toFixed(2)}`}</Text>
                      </div>
                    )}
                    {otherChargesBreakdown.parking.expense > 0 && (
                      <div className={bemClass([blk, 'breakdown-row', ['small']])}>
                        <Text
                          typography="s"
                          color="gray"
                        >
                          Parking
                        </Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`₹${otherChargesBreakdown.parking.expense.toFixed(2)}`}</Text>
                      </div>
                    )}
                    {otherChargesBreakdown.nightHalt.expense > 0 && (
                      <div className={bemClass([blk, 'breakdown-row', ['small']])}>
                        <Text
                          typography="s"
                          color="gray"
                        >
                          Night Halt
                        </Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`₹${otherChargesBreakdown.nightHalt.expense.toFixed(2)}`}</Text>
                      </div>
                    )}
                    {otherChargesBreakdown.driverAllowance.expense > 0 && (
                      <div className={bemClass([blk, 'breakdown-row', ['small']])}>
                        <Text
                          typography="s"
                          color="gray"
                        >
                          Driver Allowance
                        </Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`₹${otherChargesBreakdown.driverAllowance.expense.toFixed(2)}`}</Text>
                      </div>
                    )}
                    {otherChargesBreakdown.totalExpense === 0 && (
                      <Text
                        typography="s"
                        color="gray"
                      >
                        No expenses
                      </Text>
                    )}
                  </div>
                  <div className={bemClass([blk, 'breakdown-row', ['subtotal']])}>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >
                      Other Charges Total
                    </Text>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >{`₹${otherChargesBreakdown.totalExpense.toFixed(2)}`}</Text>
                  </div>

                  <div className={bemClass([blk, 'breakdown-divider'])} />
                  <div className={bemClass([blk, 'breakdown-row', ['total']])}>
                    <Text
                      typography="m"
                      color="error"
                    >
                      Total Request Expense
                    </Text>
                    <Text
                      typography="m"
                      color="error"
                    >{`₹${breakdown.requestExpense.toFixed(2)}`}</Text>
                  </div>
                </div>
              </div>

              {/* Request Profit Breakdown */}
              <div className={bemClass([blk, 'breakdown-section'])}>
                <Text
                  typography="m"
                  color="success"
                  tag={'p'}
                  className={bemClass([blk, 'section-title'])}
                >
                  3. Request Profit
                </Text>
                <div className={bemClass([blk, 'breakdown-content'])}>
                  <div className={bemClass([blk, 'breakdown-row'])}>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >
                      Request Total
                    </Text>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >{`₹${breakdown.requestTotal.toFixed(2)}`}</Text>
                  </div>
                  <div className={bemClass([blk, 'breakdown-row'])}>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >
                      Request Expense
                    </Text>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >{`- ₹${breakdown.requestExpense.toFixed(2)}`}</Text>
                  </div>
                  <div className={bemClass([blk, 'breakdown-divider'])} />
                  <div className={bemClass([blk, 'breakdown-row', ['total']])}>
                    <Text
                      typography="m"
                      color="success"
                    >
                      Request Profit
                    </Text>
                    <Text
                      typography="m"
                      color="success"
                    >{`₹${breakdown.requestProfit.toFixed(2)}`}</Text>
                  </div>
                  <Alert
                    type={breakdown.requestProfit >= 0 ? 'success' : 'error'}
                    message={breakdown.requestProfit >= 0 ? 'Profitable request' : 'Loss-making request'}
                  />
                </div>
              </div>

              {/* Customer Bill Breakdown */}
              <div className={bemClass([blk, 'breakdown-section'])}>
                <Text
                  typography="m"
                  color="primary"
                  tag={'p'}
                  className={bemClass([blk, 'section-title'])}
                >
                  4. Customer Bill
                </Text>
                <div className={bemClass([blk, 'breakdown-content'])}>
                  <div className={bemClass([blk, 'breakdown-row'])}>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >
                      Request Total (Package)
                    </Text>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >{`₹${breakdown.requestTotal.toFixed(2)}`}</Text>
                  </div>
                  <div className={bemClass([blk, 'breakdown-divider'])} />

                  <Text
                    typography="s"
                    color="gray-darker"
                    className={bemClass([blk, 'subsection-header'])}
                  >
                    Additional Charges
                  </Text>
                  <div className={bemClass([blk, 'breakdown-detail'])}>
                    {otherChargesBreakdown.toll.customerCharge > 0 && (
                      <div className={bemClass([blk, 'breakdown-row', ['small']])}>
                        <Text
                          typography="s"
                          color="gray"
                        >
                          Toll
                        </Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`₹${otherChargesBreakdown.toll.customerCharge.toFixed(2)}`}</Text>
                      </div>
                    )}
                    {otherChargesBreakdown.parking.customerCharge > 0 && (
                      <div className={bemClass([blk, 'breakdown-row', ['small']])}>
                        <Text
                          typography="s"
                          color="gray"
                        >
                          Parking
                        </Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`₹${otherChargesBreakdown.parking.customerCharge.toFixed(2)}`}</Text>
                      </div>
                    )}
                    {otherChargesBreakdown.nightHalt.customerCharge > 0 && (
                      <div className={bemClass([blk, 'breakdown-row', ['small']])}>
                        <Text
                          typography="s"
                          color="gray"
                        >
                          Night Halt
                        </Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`₹${otherChargesBreakdown.nightHalt.customerCharge.toFixed(2)}`}</Text>
                      </div>
                    )}
                    {otherChargesBreakdown.driverAllowance.customerCharge > 0 && (
                      <div className={bemClass([blk, 'breakdown-row', ['small']])}>
                        <Text
                          typography="s"
                          color="gray"
                        >
                          Driver Allowance
                        </Text>
                        <Text
                          typography="s"
                          color="gray"
                        >{`₹${otherChargesBreakdown.driverAllowance.customerCharge.toFixed(2)}`}</Text>
                      </div>
                    )}
                    {otherChargesBreakdown.totalCustomerCharge === 0 && (
                      <Text
                        typography="s"
                        color="gray"
                      >
                        No additional charges
                      </Text>
                    )}
                  </div>
                  <div className={bemClass([blk, 'breakdown-row', ['subtotal']])}>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >
                      Additional Charges Total
                    </Text>
                    <Text
                      typography="s"
                      color="gray-darker"
                    >{`₹${otherChargesBreakdown.totalCustomerCharge.toFixed(2)}`}</Text>
                  </div>

                  <div className={bemClass([blk, 'breakdown-divider'])} />
                  <div className={bemClass([blk, 'breakdown-row', ['total']])}>
                    <Text
                      typography="m"
                      color="primary"
                    >
                      Final Customer Bill
                    </Text>
                    <Text
                      typography="m"
                      color="primary"
                    >{`₹${breakdown.customerBill.toFixed(2)}`}</Text>
                  </div>
                </div>
              </div>
              </div>
              <div className={bemClass([blk, 'modal-footer'])}>
                <Button
                  size="medium"
                  category="default"
                  clickHandler={() => setShowCalculationModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </>
  )
}

export default CreateRegularRequest
