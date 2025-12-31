import React, { FunctionComponent, useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { bemClass, nameToPath, validatePayload } from '@utils'
import { Breadcrumb, Button, Column, Panel, Row, SelectInput, Text, TextInput, NumberInput, DateTimeInput, TextArea, RadioGroup, Alert, ReadOnlyText, CheckBox, Toggle } from '@base'
import { MonthlyFixedRequestModel, INITIAL_MONTHLY_FIXED_REQUEST } from '@types'
import { ConfiguredInput } from '@base'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'
import { useCustomerByCategory, useCustomerByIdQuery } from '@api/queries/customer'
import { useVehicleByCategory } from '@api/queries/vehicle'
import { useSuppliersQuery } from '@api/queries/supplier'
import { usePackageByCategoryWithFilter } from '@api/queries/package'
import { useStaffByCategory } from '@api/queries/staff'
import { useCreateFixedRequestMutation, useUpdateFixedRequestMutation, useFixedRequestByIdQuery } from '@api/queries/fixed-request'
import { useToast } from '@contexts/ToastContext'
import { createValidationSchema } from './validation'

import './style.scss'

const blk = 'create-monthly-fixed-request'

interface CreateMonthlyFixedRequestProps {}

const CreateMonthlyFixedRequest: FunctionComponent<CreateMonthlyFixedRequestProps> = () => {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const { showToast } = useToast()

  // API Mutations
  const createFixedRequestMutation = useCreateFixedRequestMutation()
  const updateFixedRequestMutation = useUpdateFixedRequestMutation()
  const { data: existingFixedRequest, isError: fixedRequestIsError } = useFixedRequestByIdQuery(id || '')
  
  const [monthlyFixedRequest, setMonthlyFixedRequest] = useState<MonthlyFixedRequestModel>(INITIAL_MONTHLY_FIXED_REQUEST)
  const [monthlyFixedRequestErrorMap, setMonthlyFixedRequestErrorMap] = useState<Record<string, any>>({})
  const [isValidationError, setIsValidationError] = useState(false)
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false)
  const [customerOptions, setCustomerOptions] = useState<{ key: any; value: any }[]>([])
  const [selectedCustomerHasMonthlyFixed, setSelectedCustomerHasMonthlyFixed] = useState<boolean>(false)
  const [assignmentDisplayDetails, setAssignmentDisplayDetails] = useState<{
    packageCode: string
    vehicleName: string
    vehicleRegistrationNo: string
    staffName: string
  }>({ packageCode: '', vehicleName: '', vehicleRegistrationNo: '', staffName: '' })
  const [vehicleOptions, setVehicleOptions] = useState<{ key: any; value: any }[]>([])
  const [supplierOptions, setSupplierOptions] = useState<{ key: any; value: any }[]>([])
  const [supplierVehicleOptions, setSupplierVehicleOptions] = useState<{ key: any; value: any }[]>([])
  const [supplierPackageOptions, setSupplierPackageOptions] = useState<{ key: any; value: any }[]>([])
  const [staffOptions, setStaffOptions] = useState<{ key: any; value: any }[]>([])
  const [apiErrors, setApiErrors] = useState({
    customers: '',
    vehicles: '',
    suppliers: '',
    supplierVehicles: '',
    supplierPackages: '',
    staff: '',
  })

  // Helper function to format minutes to duration string
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

  // Category path for customer API query
  const customerCategoryPath = React.useMemo(() => {
    return monthlyFixedRequest.customerDetails.customerCategory
      ? nameToPath(monthlyFixedRequest.customerDetails.customerCategory)
      : ''
  }, [monthlyFixedRequest.customerDetails.customerCategory])

  // API query for customers
  const { data: customers, error: customersError, isLoading: customersLoading, isError: customersIsError } = useCustomerByCategory(customerCategoryPath)

  // API query for selected customer details (to check monthlyFixedDetails)
  const selectedCustomerId = typeof monthlyFixedRequest.customerDetails.customer === 'string'
    ? monthlyFixedRequest.customerDetails.customer
    : monthlyFixedRequest.customerDetails.customer?._id || ''
  const { data: selectedCustomerData, isError: selectedCustomerIsError } = useCustomerByIdQuery(selectedCustomerId || '')

  // Category path for vehicle API query
  const vehicleCategoryPath = useMemo(() => {
    return monthlyFixedRequest.vehicleDetails.vehicleType === 'existing' && monthlyFixedRequest.vehicleDetails.vehicleCategory
      ? nameToPath(monthlyFixedRequest.vehicleDetails.vehicleCategory)
      : ''
  }, [monthlyFixedRequest.vehicleDetails.vehicleType, monthlyFixedRequest.vehicleDetails.vehicleCategory])

  // API query for vehicles
  const { data: vehicles, error: vehiclesError, isLoading: vehiclesLoading, isError: vehiclesIsError } = useVehicleByCategory(vehicleCategoryPath)

  // Check if supplier vehicle
  const isSupplierVehicle = monthlyFixedRequest.vehicleDetails.vehicleType === 'existing' && 
    monthlyFixedRequest.vehicleDetails.vehicleCategory && 
    nameToPath(monthlyFixedRequest.vehicleDetails.vehicleCategory) === 'supplier'

  // API query for suppliers (only when supplier vehicle)
  const { data: suppliers, error: suppliersError, isLoading: suppliersLoading, isError: suppliersIsError } = useSuppliersQuery(!!isSupplierVehicle)

  // API query for supplier vehicles (when supplier is selected)
  const supplierVehicleFilter = isSupplierVehicle && monthlyFixedRequest.vehicleDetails.supplierDetails.supplier
    ? { supplier: monthlyFixedRequest.vehicleDetails.supplierDetails.supplier }
    : null
  const { data: supplierVehicles, error: supplierVehiclesError, isLoading: supplierVehiclesLoading, isError: supplierVehiclesIsError } = useVehicleByCategory(
    isSupplierVehicle && monthlyFixedRequest.vehicleDetails.supplierDetails.supplier ? 'supplier' : ''
  )

  // API query for supplier packages (only when supplier is selected)
  const supplierPackageFilter = isSupplierVehicle && monthlyFixedRequest.vehicleDetails.supplierDetails.supplier
    ? { supplier: monthlyFixedRequest.vehicleDetails.supplierDetails.supplier }
    : null
  const { data: supplierPackages, error: supplierPackagesError, isLoading: supplierPackagesLoading, isError: supplierPackagesIsError } = usePackageByCategoryWithFilter('supplier', supplierPackageFilter)

  // Category path for staff API query
  const staffCategoryPath = useMemo(() => {
    return monthlyFixedRequest.staffDetails.staffType === 'existing' && monthlyFixedRequest.staffDetails.staffCategory
      ? nameToPath(monthlyFixedRequest.staffDetails.staffCategory)
      : ''
  }, [monthlyFixedRequest.staffDetails.staffType, monthlyFixedRequest.staffDetails.staffCategory])

  // API query for staff
  const { data: staff, error: staffError, isLoading: staffLoading, isError: staffIsError } = useStaffByCategory(staffCategoryPath)

  // Handle error when loading existing fixed request (edit mode)
  useEffect(() => {
    if (isEditing && fixedRequestIsError) {
      showToast('Unable to load monthly fixed request data. Redirecting to list...', 'error')
      setTimeout(() => navigate('/requests/monthly-fixed'), 2000)
    }
  }, [isEditing, fixedRequestIsError, showToast, navigate])

  // Load existing fixed request data when editing
  useEffect(() => {
    if (isEditing && existingFixedRequest) {
      const response = existingFixedRequest
      
      // Helper function to extract ID from populated or string field
      const extractId = (field: any): string => {
        if (typeof field === 'string') return field
        if (field && typeof field === 'object' && field._id) return field._id
        return ''
      }

      setMonthlyFixedRequest({
        customerDetails: {
          customerCategory: response.customerDetails?.customerCategory || '',
          customer: extractId(response.customerDetails?.customer),
        },
        assignmentDetails: {
          packageCategory: response.assignmentDetails?.packageCategory || '',
          package: extractId(response.assignmentDetails?.package),
          vehicleCategory: response.assignmentDetails?.vehicleCategory || '',
          vehicle: extractId(response.assignmentDetails?.vehicle),
          staffCategory: response.assignmentDetails?.staffCategory || '',
          staff: extractId(response.assignmentDetails?.staff),
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
        vehicleDetails: {
          vehicleType: response.vehicleDetails?.vehicleType || 'regular',
          vehicleCategory: response.vehicleDetails?.vehicleCategory || null,
          vehicle: response.vehicleDetails?.vehicle ? extractId(response.vehicleDetails.vehicle) : null,
          supplierDetails: {
            supplier: response.vehicleDetails?.supplierDetails?.supplier ? extractId(response.vehicleDetails.supplierDetails.supplier) : null,
            package: response.vehicleDetails?.supplierDetails?.package ? extractId(response.vehicleDetails.supplierDetails.package) : null,
          },
          newVehicleDetails: response.vehicleDetails?.newVehicleDetails || null,
        },
        staffDetails: {
          staffType: response.staffDetails?.staffType || 'regular',
          staffCategory: response.staffDetails?.staffCategory || null,
          staff: response.staffDetails?.staff ? extractId(response.staffDetails.staff) : null,
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
        paymentDetails: {
          advanceAmountPaid: response.paymentDetails?.advanceAmountPaid || 0,
        },
        comment: response.comment || '',
        supplierExpense: response.supplierExpense || 0,
      })

      // Load assignment display details if customer is populated
      if (response.customerDetails?.customer && typeof response.customerDetails.customer === 'object') {
        const customer = response.customerDetails.customer
        if (customer.monthlyFixedDetails) {
          setAssignmentDisplayDetails({
            packageCode: customer.monthlyFixedDetails.package?.packageCode || '',
            vehicleName: customer.monthlyFixedDetails.vehicle?.name || '',
            vehicleRegistrationNo: customer.monthlyFixedDetails.vehicle?.registrationNumber || '',
            staffName: customer.monthlyFixedDetails.staff?.name || '',
          })
        }
      }
    }
  }, [isEditing, existingFixedRequest])

  // Handle vehicle API response
  useEffect(() => {
    if (vehiclesIsError) {
      const errorMessage = 'Unable to load vehicle data. Please check your connection and try again.'
      setApiErrors(prev => ({
        ...prev,
        vehicles: errorMessage,
      }))
      setVehicleOptions([])
      showToast(errorMessage, 'error')
    } else if (vehicles?.data?.length > 0) {
      const options = vehicles.data.map((vehicle: { _id: any; name: any }) => ({
        key: vehicle._id,
        value: vehicle.name,
      }))
      setVehicleOptions(options)
      setApiErrors(prev => ({
        ...prev,
        vehicles: '',
      }))
    } else {
      setVehicleOptions([])
      setApiErrors(prev => ({
        ...prev,
        vehicles: '',
      }))
    }
  }, [vehicles, vehiclesError, vehiclesIsError, showToast])

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
  }, [isSupplierVehicle, suppliers, suppliersError, suppliersIsError, showToast])

  // Handle supplier vehicle API response
  useEffect(() => {
    if (!isSupplierVehicle || !monthlyFixedRequest.vehicleDetails.supplierDetails.supplier) {
      setSupplierVehicleOptions([])
      setApiErrors(prev => ({ ...prev, supplierVehicles: '' }))
      return
    }

    if (supplierVehiclesIsError) {
      const errorMessage = 'Unable to load supplier vehicle data. Please check your connection and try again.'
      setApiErrors(prev => ({
        ...prev,
        supplierVehicles: errorMessage,
      }))
      setSupplierVehicleOptions([])
      showToast(errorMessage, 'error')
    } else if (supplierVehicles?.data?.length > 0) {
      // Filter vehicles by selected supplier
      const filteredVehicles = supplierVehicles.data.filter(
        (vehicle: any) => vehicle.supplier?._id === monthlyFixedRequest.vehicleDetails.supplierDetails.supplier ||
                          vehicle.supplier === monthlyFixedRequest.vehicleDetails.supplierDetails.supplier
      )
      const options = filteredVehicles.map((vehicle: { _id: any; name: any }) => ({
        key: vehicle._id,
        value: vehicle.name,
      }))
      setSupplierVehicleOptions(options)
      setApiErrors(prev => ({ ...prev, supplierVehicles: '' }))
    } else {
      setSupplierVehicleOptions([])
      setApiErrors(prev => ({ ...prev, supplierVehicles: '' }))
    }
  }, [isSupplierVehicle, monthlyFixedRequest.vehicleDetails.supplierDetails.supplier, supplierVehicles, supplierVehiclesError, supplierVehiclesIsError, showToast])

  // Handle supplier package API response
  useEffect(() => {
    if (!isSupplierVehicle || !monthlyFixedRequest.vehicleDetails.supplierDetails.supplier) {
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
  }, [isSupplierVehicle, monthlyFixedRequest.vehicleDetails.supplierDetails.supplier, supplierPackages, supplierPackagesError, supplierPackagesIsError, showToast])

  // Validate selected customer has monthlyFixedDetails and populate assignmentDetails
  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomerHasMonthlyFixed(false)
      return
    }

    if (selectedCustomerIsError) {
      showToast('Unable to load customer details. Please try again.', 'error')
      setSelectedCustomerHasMonthlyFixed(false)
      return
    }

    if (selectedCustomerData) {
      // Check if customer has monthlyFixedDetails
      if (!selectedCustomerData.monthlyFixedDetails) {
        setSelectedCustomerHasMonthlyFixed(false)
        showToast(
          'This customer does not have monthly fixed assignment. Please select a customer with monthly fixed details or configure them in the customer master.',
          'error'
        )
        // Clear customer selection
        setMonthlyFixedRequest(prev => ({
          ...prev,
          customerDetails: {
            ...prev.customerDetails,
            customer: '',
          },
          assignmentDetails: {
            packageCategory: '',
            package: '',
            vehicleCategory: '',
            vehicle: '',
            staffCategory: '',
            staff: '',
          },
        }))
        setAssignmentDisplayDetails({
          packageCode: '',
          vehicleName: '',
          vehicleRegistrationNo: '',
          staffName: '',
        })
        return
      }

      // Customer has monthlyFixedDetails, populate assignmentDetails with IDs only (for BE)
      setSelectedCustomerHasMonthlyFixed(true)
      const { monthlyFixedDetails } = selectedCustomerData
      
      // Extract IDs for backend
      const packageId = typeof monthlyFixedDetails.package === 'string'
        ? monthlyFixedDetails.package
        : monthlyFixedDetails.package?._id || ''
      
      const vehicleId = typeof monthlyFixedDetails.vehicle === 'string'
        ? monthlyFixedDetails.vehicle
        : monthlyFixedDetails.vehicle?._id || ''
      
      const staffId = typeof monthlyFixedDetails.staff === 'string'
        ? monthlyFixedDetails.staff
        : monthlyFixedDetails.staff?._id || ''
      
      // Update backend state with IDs only
      setMonthlyFixedRequest(prev => ({
        ...prev,
        assignmentDetails: {
          packageCategory: monthlyFixedDetails.packageCategory || '',
          package: packageId,
          vehicleCategory: monthlyFixedDetails.vehicleCategory || '',
          vehicle: vehicleId,
          staffCategory: monthlyFixedDetails.staffCategory || '',
          staff: staffId,
        },
      }))
      
      // Update display state with names (for FE display only)
      setAssignmentDisplayDetails({
        packageCode: typeof monthlyFixedDetails.package === 'object' && monthlyFixedDetails.package
          ? monthlyFixedDetails.package.packageCode || ''
          : '',
        vehicleName: typeof monthlyFixedDetails.vehicle === 'object' && monthlyFixedDetails.vehicle
          ? monthlyFixedDetails.vehicle.name || ''
          : '',
        vehicleRegistrationNo: typeof monthlyFixedDetails.vehicle === 'object' && monthlyFixedDetails.vehicle
          ? monthlyFixedDetails.vehicle.registrationNo || ''
          : '',
        staffName: typeof monthlyFixedDetails.staff === 'object' && monthlyFixedDetails.staff
          ? monthlyFixedDetails.staff.name || ''
          : '',
      })

      showToast(
        `Monthly fixed assignment loaded: ${typeof monthlyFixedDetails.vehicle === 'object' ? monthlyFixedDetails.vehicle?.name : 'Vehicle'} assigned with ${typeof monthlyFixedDetails.staff === 'object' ? monthlyFixedDetails.staff?.name : 'Staff'}`,
        'success'
      )
    }
  }, [selectedCustomerId, selectedCustomerData, selectedCustomerIsError, showToast])

  // Auto-calculate totalKm when openingKm or closingKm changes
  useEffect(() => {
    const { openingKm, closingKm } = monthlyFixedRequest.requestDetails
    const totalKm = closingKm && openingKm ? closingKm - openingKm : 0
    
    setMonthlyFixedRequest(prev => ({
      ...prev,
      requestDetails: {
        ...prev.requestDetails,
        totalKm: totalKm > 0 ? totalKm : null,
      },
    }))
  }, [monthlyFixedRequest.requestDetails.openingKm, monthlyFixedRequest.requestDetails.closingKm])

  // Auto-calculate totalHr when pickUpDateTime or dropDateTime changes
  useEffect(() => {
    const { pickUpDateTime, dropDateTime } = monthlyFixedRequest.requestDetails
    const totalHr =
      pickUpDateTime && dropDateTime
        ? (new Date(dropDateTime).getTime() - new Date(pickUpDateTime).getTime()) / (1000 * 60)
        : 0

    setMonthlyFixedRequest(prev => ({
      ...prev,
      requestDetails: {
        ...prev.requestDetails,
        totalHr: totalHr > 0 ? totalHr : null,
      },
    }))
  }, [monthlyFixedRequest.requestDetails.pickUpDateTime, monthlyFixedRequest.requestDetails.dropDateTime])

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
  }, [customers, customersError, customersIsError, showToast])

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
  }, [staff, staffError, staffIsError, showToast])

  const navigateBack = () => {
    navigate('/requests/monthly-fixed')
  }

  const submitHandler = async () => {
    // Check for API errors before validation
    const hasApiErrors = Object.values(apiErrors).some(error => error !== '')
    if (hasApiErrors) {
      showToast('Cannot submit. Please resolve data loading errors first.', 'error')
      return
    }

    const validationSchema = createValidationSchema(monthlyFixedRequest)
    const { isValid, errorMap } = validatePayload(validationSchema, monthlyFixedRequest)

    setIsValidationError(!isValid)
    setMonthlyFixedRequestErrorMap(errorMap)
    
    if (isValid) {
      setIsValidationError(false)
      
      try {
        
        if (isEditing) {
          await updateFixedRequestMutation.mutateAsync({ _id: id, ...monthlyFixedRequest })
          showToast('Monthly fixed request updated successfully!', 'success')
        } else {
          await createFixedRequestMutation.mutateAsync(monthlyFixedRequest)
          showToast('New monthly fixed request created successfully!', 'success')
        }
        navigateBack()
      } catch (error) {
        showToast(`Unable to ${isEditing ? 'update' : 'create'} monthly fixed request. Please try again.`, 'error')
      }
    } else {
      showToast('Please correct the errors before submitting.', 'error')
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

        {isValidationError && (
          <Alert
            type="error"
            message="Please review and correct the errors indicated below before submitting."
            className={bemClass([blk, 'margin-bottom'])}
          />
        )}
        {(apiErrors.customers || apiErrors.vehicles || apiErrors.suppliers || apiErrors.supplierVehicles || apiErrors.supplierPackages || apiErrors.staff) && (
          <Alert
            type="error"
            message={`Some data could not be loaded: ${[apiErrors.customers, apiErrors.vehicles, apiErrors.suppliers, apiErrors.supplierVehicles, apiErrors.supplierPackages, apiErrors.staff].filter(Boolean).join(', ')}`}
            className={bemClass([blk, 'margin-bottom'])}
          />
        )}

        <div className={bemClass([blk, 'content'])}>
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
                  value={monthlyFixedRequest.customerDetails.customerCategory || ''}
                  changeHandler={value => {
                    const updatedData = {
                      ...monthlyFixedRequest,
                      customerDetails: {
                        ...monthlyFixedRequest.customerDetails,
                        customerCategory: value.customerCategory ? nameToPath(value.customerCategory.toString()) : '',
                        customer: '', // Clear customer when category changes
                      },
                    }
                    setMonthlyFixedRequest(updatedData)
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['customerDetails.customerCategory']}
                  invalid={!!monthlyFixedRequestErrorMap['customerDetails.customerCategory']}
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
                    monthlyFixedRequest.customerDetails.customer
                      ? typeof monthlyFixedRequest.customerDetails.customer === 'string'
                        ? (customerOptions.find((option: any) => option.key === monthlyFixedRequest.customerDetails.customer) as any)?.value ?? ''
                        : (customerOptions.find((option: any) => option.key === (monthlyFixedRequest.customerDetails.customer as any)._id) as any)?.value ?? ''
                      : ''
                  }
                  changeHandler={value => {
                    const selectedOption = customerOptions.find((option: any) => option.value === value.customer) as any
                    if (!selectedOption || ['Please wait...', 'Unable to load options', 'No customers found'].includes(value.customer as string)) {
                      return
                    }
                    const updatedData = {
                      ...monthlyFixedRequest,
                      customerDetails: {
                        ...monthlyFixedRequest.customerDetails,
                        customer: selectedOption.key,
                      },
                    }
                    setMonthlyFixedRequest(updatedData)
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['customerDetails.customer']}
                  invalid={!!monthlyFixedRequestErrorMap['customerDetails.customer']}
                  disabled={!monthlyFixedRequest.customerDetails.customerCategory}
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
                  value={monthlyFixedRequest.requestDetails.requestType}
                  changeHandler={value => {
                    const updatedData = {
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        requestType: value.requestType ? value.requestType.toString() : '',
                      },
                    }
                    setMonthlyFixedRequest(updatedData)
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['requestDetails.requestType']}
                  invalid={!!monthlyFixedRequestErrorMap['requestDetails.requestType']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Pickup Location"
                  name="pickUpLocation"
                  value={monthlyFixedRequest.requestDetails.pickUpLocation}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        pickUpLocation: value.pickUpLocation?.toString() ?? '',
                      },
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['requestDetails.pickUpLocation']}
                  invalid={!!monthlyFixedRequestErrorMap['requestDetails.pickUpLocation']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Drop Location"
                  name="dropOffLocation"
                  value={monthlyFixedRequest.requestDetails.dropOffLocation}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        dropOffLocation: value.dropOffLocation?.toString() ?? '',
                      },
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['requestDetails.dropOffLocation']}
                  invalid={!!monthlyFixedRequestErrorMap['requestDetails.dropOffLocation']}
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
                  value={monthlyFixedRequest.requestDetails.pickUpDateTime}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        pickUpDateTime: value.pickUpDateTime,
                      },
                    })
                  }}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['requestDetails.pickUpDateTime']}
                  invalid={!!monthlyFixedRequestErrorMap['requestDetails.pickUpDateTime']}
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
                  value={monthlyFixedRequest.requestDetails.dropDateTime}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        dropDateTime: value.dropDateTime,
                      },
                    })
                  }}
                  required
                  disabled={!monthlyFixedRequest.requestDetails.pickUpDateTime}
                  min={monthlyFixedRequest.requestDetails.pickUpDateTime || undefined}
                  errorMessage={monthlyFixedRequestErrorMap['requestDetails.dropDateTime']}
                  invalid={!!monthlyFixedRequestErrorMap['requestDetails.dropDateTime']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'read-only'])}
              >
                <ReadOnlyText
                  label="Duration"
                  value={monthlyFixedRequest.requestDetails.totalHr ? formatMinutesToDuration(monthlyFixedRequest.requestDetails.totalHr) : '-'}
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
                  value={monthlyFixedRequest.requestDetails.openingKm ?? ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        openingKm: value.openingKm ?? null,
                      },
                    })
                  }}
                  min={0}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['requestDetails.openingKm']}
                  invalid={!!monthlyFixedRequestErrorMap['requestDetails.openingKm']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <NumberInput
                  label="Closing Km"
                  name="closingKm"
                  value={monthlyFixedRequest.requestDetails.closingKm ?? ''}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        closingKm: value.closingKm ?? null,
                      },
                    })
                  }}
                  min={monthlyFixedRequest.requestDetails.openingKm || 0}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['requestDetails.closingKm']}
                  invalid={!!monthlyFixedRequestErrorMap['requestDetails.closingKm']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'read-only'])}
              >
                <ReadOnlyText
                  label="Total Distance"
                  value={monthlyFixedRequest.requestDetails.totalKm ? `${monthlyFixedRequest.requestDetails.totalKm} km` : '-'}
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
                  value={monthlyFixedRequest.requestDetails.ac ? 'Yes' : 'No'}
                  changeHandler={value => {
                    const updatedData = {
                      ...monthlyFixedRequest,
                      requestDetails: {
                        ...monthlyFixedRequest.requestDetails,
                        ac: value.ac === 'Yes',
                      },
                    }
                    setMonthlyFixedRequest(updatedData)
                  }}
                  direction="horizontal"
                />
              </Column>
            </Row>
          </Panel>

          {/* Vehicle Assignment Panel - Read-only assignment from customer monthly fixed details */}
          {selectedCustomerHasMonthlyFixed && (
            <Panel
              title="Vehicle Assignment (From Customer Monthly Fixed)"
              className={bemClass([blk, 'margin-bottom'])}
            >
              <Row>
                <Column
                  col={3}
                  className={bemClass([blk, 'read-only'])}
                >
                  <ReadOnlyText
                    label="Package Category"
                    value={monthlyFixedRequest.assignmentDetails.packageCategory || '-'}
                  />
                </Column>
                <Column
                  col={3}
                  className={bemClass([blk, 'read-only'])}
                >
                  <ReadOnlyText
                    label="Package"
                    value={assignmentDisplayDetails.packageCode || '-'}
                  />
                </Column>
                <Column
                  col={3}
                  className={bemClass([blk, 'read-only'])}
                >
                  <ReadOnlyText
                    label="Vehicle Category"
                    value={monthlyFixedRequest.assignmentDetails.vehicleCategory || '-'}
                  />
                </Column>
                <Column
                  col={3}
                  className={bemClass([blk, 'read-only'])}
                >
                  <ReadOnlyText
                    label="Vehicle"
                    value={
                      assignmentDisplayDetails.vehicleName && assignmentDisplayDetails.vehicleRegistrationNo
                        ? `${assignmentDisplayDetails.vehicleName} (${assignmentDisplayDetails.vehicleRegistrationNo})`
                        : assignmentDisplayDetails.vehicleName || assignmentDisplayDetails.vehicleRegistrationNo || '-'
                    }
                  />
                </Column>
              </Row>
              <Row>
                <Column
                  col={3}
                  className={bemClass([blk, 'read-only'])}
                >
                  <ReadOnlyText
                    label="Staff Category"
                    value={monthlyFixedRequest.assignmentDetails.staffCategory || '-'}
                  />
                </Column>
                <Column
                  col={3}
                  className={bemClass([blk, 'read-only'])}
                >
                  <ReadOnlyText
                    label="Staff"
                    value={assignmentDisplayDetails.staffName || '-'}
                  />
                </Column>
              </Row>
            </Panel>
          )}

          {/* Vehicle Details Panel - For additional vehicle usage */}
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
                    { key: 'regular', value: 'Regular' },
                    { key: 'existing', value: 'Existing' },
                    { key: 'new', value: 'New' },
                  ]}
                  value={monthlyFixedRequest.vehicleDetails.vehicleType === 'regular' ? 'Regular' : monthlyFixedRequest.vehicleDetails.vehicleType === 'existing' ? 'Existing' : 'New'}
                  changeHandler={value => {
                    const selectedType = value.vehicleType === 'Regular' ? 'regular' : value.vehicleType === 'Existing' ? 'existing' : 'new'
                    const updatedData = {
                      ...monthlyFixedRequest,
                      vehicleDetails: {
                        ...monthlyFixedRequest.vehicleDetails,
                        vehicleType: selectedType as 'regular' | 'existing' | 'new',
                        vehicleCategory: selectedType === 'new' ? null : (monthlyFixedRequest.vehicleDetails.vehicleCategory ? nameToPath(monthlyFixedRequest.vehicleDetails.vehicleCategory) : null),
                        vehicle: selectedType === 'new' ? null : monthlyFixedRequest.vehicleDetails.vehicle,
                        supplierDetails: selectedType === 'new' ? { supplier: null, package: null } : monthlyFixedRequest.vehicleDetails.supplierDetails,
                        newVehicleDetails:
                          selectedType === 'existing' || selectedType === 'regular'
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
                    setMonthlyFixedRequest(updatedData)
                  }}
                  showPlaceholder={false}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.vehicleType']}
                  invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.vehicleType']}
                />
              </Column>
            </Row>
            {monthlyFixedRequest.vehicleDetails.vehicleType === 'existing' && (
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
                      value={monthlyFixedRequest.vehicleDetails.vehicleCategory || ''}
                      changeHandler={value => {
                        const updatedData = {
                          ...monthlyFixedRequest,
                          vehicleDetails: {
                            ...monthlyFixedRequest.vehicleDetails,
                            vehicleCategory: value.vehicleCategory?.toString() ?? '',
                            vehicle: null,
                            supplierDetails: { supplier: null, package: null },
                          },
                        }
                        setMonthlyFixedRequest(updatedData)
                        setSupplierPackageOptions([])
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.vehicleCategory']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.vehicleCategory']}
                    />
                  </Column>
                  {!isSupplierVehicle && (
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <SelectInput
                        label="Vehicle"
                        name="vehicle"
                        options={
                          vehiclesLoading
                            ? [{ key: 'loading', value: 'Please wait...' }]
                            : vehiclesIsError
                              ? [{ key: 'error', value: 'Unable to load options' }]
                              : vehicleOptions.length > 0
                                ? vehicleOptions
                                : [{ key: 'no-data', value: 'No vehicles found' }]
                        }
                        value={
                          monthlyFixedRequest.vehicleDetails.vehicle
                            ? typeof monthlyFixedRequest.vehicleDetails.vehicle === 'string'
                              ? (vehicleOptions.find((option: any) => option.key === monthlyFixedRequest.vehicleDetails.vehicle) as any)?.value ?? ''
                              : (vehicleOptions.find((option: any) => option.key === (monthlyFixedRequest.vehicleDetails.vehicle as any)._id) as any)?.value ?? ''
                            : ''
                        }
                        changeHandler={value => {
                          const selectedOption = vehicleOptions.find((option: any) => option.value === value.vehicle) as any
                          if (!selectedOption || ['Please wait...', 'Unable to load options', 'No vehicles found'].includes(value.vehicle as string)) {
                            return
                          }
                          const updatedData = {
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails,
                              vehicle: selectedOption.key,
                            },
                          }
                          setMonthlyFixedRequest(updatedData)
                        }}
                        required
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.vehicle']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.vehicle']}
                        disabled={!monthlyFixedRequest.vehicleDetails.vehicleCategory}
                      />
                    </Column>
                  )}
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
                          monthlyFixedRequest.vehicleDetails.supplierDetails.supplier
                            ? typeof monthlyFixedRequest.vehicleDetails.supplierDetails.supplier === 'string'
                              ? (supplierOptions.find((option: any) => option.key === monthlyFixedRequest.vehicleDetails.supplierDetails.supplier) as any)?.value ?? ''
                              : (supplierOptions.find((option: any) => option.key === (monthlyFixedRequest.vehicleDetails.supplierDetails.supplier as any)._id) as any)?.value ?? ''
                            : ''
                        }
                        changeHandler={value => {
                          const selectedOption = supplierOptions.find((option: any) => option.value === value.supplier) as any
                          if (!selectedOption || ['Select vehicle category first', 'Please wait...', 'Unable to load options', 'No suppliers found'].includes(value.supplier as string)) {
                            return
                          }
                          const updatedData = {
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails,
                              supplierDetails: {
                                supplier: selectedOption.key,
                                package: null,
                              },
                              vehicle: null,
                            },
                          }
                          setMonthlyFixedRequest(updatedData)
                        }}
                        required
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.supplierDetails.supplier']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.supplierDetails.supplier']}
                      />
                    </Column>
                    <Column
                      col={4}
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <SelectInput
                        label="Vehicle"
                        name="supplierVehicle"
                        options={
                          !monthlyFixedRequest.vehicleDetails.supplierDetails.supplier
                            ? [{ key: 'empty', value: 'Select supplier first' }]
                            : supplierVehiclesLoading
                              ? [{ key: 'loading', value: 'Please wait...' }]
                              : apiErrors.supplierVehicles
                                ? [{ key: 'error', value: 'Unable to load options' }]
                                : supplierVehicleOptions.length > 0
                                  ? supplierVehicleOptions
                                  : [{ key: 'no-data', value: 'No vehicles found' }]
                        }
                        value={
                          monthlyFixedRequest.vehicleDetails.vehicle
                            ? typeof monthlyFixedRequest.vehicleDetails.vehicle === 'string'
                              ? (supplierVehicleOptions.find((option: any) => option.key === monthlyFixedRequest.vehicleDetails.vehicle) as any)?.value ?? ''
                              : (supplierVehicleOptions.find((option: any) => option.key === (monthlyFixedRequest.vehicleDetails.vehicle as any)._id) as any)?.value ?? ''
                            : ''
                        }
                        changeHandler={value => {
                          const selectedOption = supplierVehicleOptions.find((option: any) => option.value === value.supplierVehicle) as any
                          if (!selectedOption || ['Select supplier first', 'Please wait...', 'Unable to load options', 'No vehicles found'].includes(value.supplierVehicle as string)) {
                            return
                          }
                          const updatedData = {
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails,
                              vehicle: selectedOption.key,
                            },
                          }
                          setMonthlyFixedRequest(updatedData)
                        }}
                        required
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.vehicle']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.vehicle']}
                        disabled={!monthlyFixedRequest.vehicleDetails.supplierDetails.supplier}
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
                          !monthlyFixedRequest.vehicleDetails.supplierDetails.supplier
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
                          monthlyFixedRequest.vehicleDetails.supplierDetails.package
                            ? typeof monthlyFixedRequest.vehicleDetails.supplierDetails.package === 'string'
                              ? (supplierPackageOptions.find((option: any) => option.key === monthlyFixedRequest.vehicleDetails.supplierDetails.package) as any)?.value ?? ''
                              : (supplierPackageOptions.find((option: any) => option.key === (monthlyFixedRequest.vehicleDetails.supplierDetails.package as any)._id) as any)?.value ?? ''
                            : ''
                        }
                        changeHandler={value => {
                          const selectedOption = supplierPackageOptions.find((option: any) => option.value === value.supplierPackage) as any
                          if (!selectedOption || ['Select supplier first', 'Please wait...', 'Unable to load options', 'No packages found'].includes(value.supplierPackage as string)) {
                            return
                          }
                          const updatedData = {
                            ...monthlyFixedRequest,
                            vehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails,
                              supplierDetails: {
                                ...monthlyFixedRequest.vehicleDetails.supplierDetails,
                                package: selectedOption.key,
                              },
                            },
                          }
                          setMonthlyFixedRequest(updatedData)
                        }}
                        required
                        errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.supplierDetails.package']}
                        invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.supplierDetails.package']}
                        disabled={!monthlyFixedRequest.vehicleDetails.supplierDetails.supplier}
                      />
                    </Column>
                  </Row>
                )}
              </>
            )}
            {monthlyFixedRequest.vehicleDetails.vehicleType === 'new' && (
              <>
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Owner Name"
                      name="ownerName"
                      value={monthlyFixedRequest.vehicleDetails.newVehicleDetails?.ownerName || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          vehicleDetails: {
                            ...monthlyFixedRequest.vehicleDetails,
                            newVehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails.newVehicleDetails!,
                              ownerName: value.ownerName?.toString() ?? '',
                            },
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.ownerName']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.ownerName']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Owner Contact"
                      name="ownerContact"
                      value={monthlyFixedRequest.vehicleDetails.newVehicleDetails?.ownerContact || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          vehicleDetails: {
                            ...monthlyFixedRequest.vehicleDetails,
                            newVehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails.newVehicleDetails!,
                              ownerContact: value.ownerContact?.toString() ?? '',
                            },
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.ownerContact']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.ownerContact']}
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
                      value={monthlyFixedRequest.vehicleDetails.newVehicleDetails?.ownerEmail || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          vehicleDetails: {
                            ...monthlyFixedRequest.vehicleDetails,
                            newVehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails.newVehicleDetails!,
                              ownerEmail: value.ownerEmail?.toString() ?? '',
                            },
                          },
                        })
                      }}
                      errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.ownerEmail']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.ownerEmail']}
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
                      value={monthlyFixedRequest.vehicleDetails.newVehicleDetails?.manufacturer || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          vehicleDetails: {
                            ...monthlyFixedRequest.vehicleDetails,
                            newVehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails.newVehicleDetails!,
                              manufacturer: value.manufacturer?.toString() ?? '',
                            },
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.manufacturer']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.manufacturer']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Vehicle Name"
                      name="vehicleName"
                      value={monthlyFixedRequest.vehicleDetails.newVehicleDetails?.name || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          vehicleDetails: {
                            ...monthlyFixedRequest.vehicleDetails,
                            newVehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails.newVehicleDetails!,
                              name: value.vehicleName?.toString() ?? '',
                            },
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.name']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.name']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Registration No"
                      name="registrationNo"
                      value={monthlyFixedRequest.vehicleDetails.newVehicleDetails?.registrationNo || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          vehicleDetails: {
                            ...monthlyFixedRequest.vehicleDetails,
                            newVehicleDetails: {
                              ...monthlyFixedRequest.vehicleDetails.newVehicleDetails!,
                              registrationNo: (value.registrationNo?.toString() ?? '').toUpperCase(),
                            },
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.registrationNo']}
                      invalid={!!monthlyFixedRequestErrorMap['vehicleDetails.newVehicleDetails.registrationNo']}
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
                    { key: 'regular', value: 'Regular' },
                    { key: 'existing', value: 'Existing' },
                    { key: 'new', value: 'New' },
                  ]}
                  value={monthlyFixedRequest.staffDetails.staffType === 'regular' ? 'Regular' : monthlyFixedRequest.staffDetails.staffType === 'existing' ? 'Existing' : 'New'}
                  changeHandler={value => {
                    const selectedType = value.staffType === 'Regular' ? 'regular' : value.staffType === 'Existing' ? 'existing' : 'new'
                    const updatedData = {
                      ...monthlyFixedRequest,
                      staffDetails: {
                        ...monthlyFixedRequest.staffDetails,
                        staffType: selectedType as 'regular' | 'existing' | 'new',
                        staffCategory: selectedType === 'new' ? null : (monthlyFixedRequest.staffDetails.staffCategory ? nameToPath(monthlyFixedRequest.staffDetails.staffCategory) : null),
                        staff: selectedType === 'new' ? null : monthlyFixedRequest.staffDetails.staff,
                        newStaffDetails:
                          selectedType === 'existing' || selectedType === 'regular'
                            ? null
                            : {
                                name: '',
                                contact: '',
                                license: '',
                              },
                      },
                    }
                    setMonthlyFixedRequest(updatedData)
                  }}
                  showPlaceholder={false}
                  required
                  errorMessage={monthlyFixedRequestErrorMap['staffDetails.staffType']}
                  invalid={!!monthlyFixedRequestErrorMap['staffDetails.staffType']}
                />
              </Column>
            </Row>
            {monthlyFixedRequest.staffDetails.staffType === 'existing' && (
              <>
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
                      value={monthlyFixedRequest.staffDetails.staffCategory || ''}
                      changeHandler={value => {
                        const updatedData = {
                          ...monthlyFixedRequest,
                          staffDetails: {
                            ...monthlyFixedRequest.staffDetails,
                            staffCategory: value.staffCategory?.toString() ?? '',
                            staff: null,
                          },
                        }
                        setMonthlyFixedRequest(updatedData)
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['staffDetails.staffCategory']}
                      invalid={!!monthlyFixedRequestErrorMap['staffDetails.staffCategory']}
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
                        monthlyFixedRequest.staffDetails.staff
                          ? typeof monthlyFixedRequest.staffDetails.staff === 'string'
                            ? (staffOptions.find((option: any) => option.key === monthlyFixedRequest.staffDetails.staff) as any)?.value ?? ''
                            : (staffOptions.find((option: any) => option.key === (monthlyFixedRequest.staffDetails.staff as any)._id) as any)?.value ?? ''
                          : ''
                      }
                      changeHandler={value => {
                        const selectedOption = staffOptions.find((option: any) => option.value === value.staff) as any
                        if (!selectedOption || ['Please wait...', 'Unable to load options', 'No staff found'].includes(value.staff as string)) {
                          return
                        }
                        const updatedData = {
                          ...monthlyFixedRequest,
                          staffDetails: {
                            ...monthlyFixedRequest.staffDetails,
                            staff: selectedOption.key,
                          },
                        }
                        setMonthlyFixedRequest(updatedData)
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['staffDetails.staff']}
                      invalid={!!monthlyFixedRequestErrorMap['staffDetails.staff']}
                      disabled={!monthlyFixedRequest.staffDetails.staffCategory}
                    />
                  </Column>
                </Row>
              </>
            )}
            {monthlyFixedRequest.staffDetails.staffType === 'new' && (
              <>
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Staff Name"
                      name="staffName"
                      value={monthlyFixedRequest.staffDetails.newStaffDetails?.name || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          staffDetails: {
                            ...monthlyFixedRequest.staffDetails,
                            newStaffDetails: {
                              ...monthlyFixedRequest.staffDetails.newStaffDetails!,
                              name: value.staffName?.toString() ?? '',
                            },
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['staffDetails.newStaffDetails.name']}
                      invalid={!!monthlyFixedRequestErrorMap['staffDetails.newStaffDetails.name']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Contact"
                      name="staffContact"
                      value={monthlyFixedRequest.staffDetails.newStaffDetails?.contact || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          staffDetails: {
                            ...monthlyFixedRequest.staffDetails,
                            newStaffDetails: {
                              ...monthlyFixedRequest.staffDetails.newStaffDetails!,
                              contact: value.staffContact?.toString() ?? '',
                            },
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['staffDetails.newStaffDetails.contact']}
                      invalid={!!monthlyFixedRequestErrorMap['staffDetails.newStaffDetails.contact']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="License No"
                      name="license"
                      value={monthlyFixedRequest.staffDetails.newStaffDetails?.license || ''}
                      changeHandler={value => {
                        setMonthlyFixedRequest({
                          ...monthlyFixedRequest,
                          staffDetails: {
                            ...monthlyFixedRequest.staffDetails,
                            newStaffDetails: {
                              ...monthlyFixedRequest.staffDetails.newStaffDetails!,
                              license: value.license?.toString() ?? '',
                            },
                          },
                        })
                      }}
                      required
                      errorMessage={monthlyFixedRequestErrorMap['staffDetails.newStaffDetails.license']}
                      invalid={!!monthlyFixedRequestErrorMap['staffDetails.newStaffDetails.license']}
                    />
                  </Column>
                </Row>
              </>
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
                <NumberInput
                  name="tollAmount"
                  placeholder="Toll Amount"
                  value={monthlyFixedRequest.otherCharges.toll.amount === 0 ? '' : monthlyFixedRequest.otherCharges.toll.amount}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        toll: {
                          ...monthlyFixedRequest.otherCharges.toll,
                          amount: value.tollAmount || 0,
                        },
                      },
                    })
                  }}
                  min={0}
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
                <NumberInput
                  name="parkingAmount"
                  placeholder="Parking Amount"
                  value={monthlyFixedRequest.otherCharges.parking.amount === 0 ? '' : monthlyFixedRequest.otherCharges.parking.amount}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        parking: {
                          ...monthlyFixedRequest.otherCharges.parking,
                          amount: value.parkingAmount || 0,
                        },
                      },
                    })
                  }}
                  min={0}
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
                <NumberInput
                  name="nightHaltAmount"
                  placeholder="Night Halt Amount"
                  value={monthlyFixedRequest.otherCharges.nightHalt.amount === 0 ? '' : monthlyFixedRequest.otherCharges.nightHalt.amount}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        nightHalt: {
                          ...monthlyFixedRequest.otherCharges.nightHalt,
                          amount: value.nightHaltAmount || 0,
                        },
                      },
                    })
                  }}
                  min={0}
                  errorMessage={monthlyFixedRequestErrorMap['otherCharges.nightHalt.amount']}
                  invalid={!!monthlyFixedRequestErrorMap['otherCharges.nightHalt.amount']}
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
                  checked={monthlyFixedRequest.otherCharges.nightHalt.isPayableWithSalary}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        nightHalt: {
                          ...monthlyFixedRequest.otherCharges.nightHalt,
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
                <NumberInput
                  name="driverAllowanceAmount"
                  placeholder="Driver Allowance Amount"
                  value={monthlyFixedRequest.otherCharges.driverAllowance.amount === 0 ? '' : monthlyFixedRequest.otherCharges.driverAllowance.amount}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        driverAllowance: {
                          ...monthlyFixedRequest.otherCharges.driverAllowance,
                          amount: value.driverAllowanceAmount || 0,
                        },
                      },
                    })
                  }}
                  min={0}
                  errorMessage={monthlyFixedRequestErrorMap['otherCharges.driverAllowance.amount']}
                  invalid={!!monthlyFixedRequestErrorMap['otherCharges.driverAllowance.amount']}
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
                  checked={monthlyFixedRequest.otherCharges.driverAllowance.isPayableWithSalary}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      otherCharges: {
                        ...monthlyFixedRequest.otherCharges,
                        driverAllowance: {
                          ...monthlyFixedRequest.otherCharges.driverAllowance,
                          isPayableWithSalary: !!value.driverAllowancePayableWithSalary,
                        },
                      },
                    })
                  }}
                />
              </Column>
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
                <NumberInput
                  label="Advance Amount Paid"
                  name="advanceAmountPaid"
                  placeholder="Enter advance amount paid"
                  value={monthlyFixedRequest.paymentDetails.advanceAmountPaid === 0 ? '' : monthlyFixedRequest.paymentDetails.advanceAmountPaid}
                  changeHandler={value => {
                    setMonthlyFixedRequest({
                      ...monthlyFixedRequest,
                      paymentDetails: {
                        ...monthlyFixedRequest.paymentDetails,
                        advanceAmountPaid: value.advanceAmountPaid || 0,
                      },
                    })
                  }}
                  min={0}
                  errorMessage={monthlyFixedRequestErrorMap['paymentDetails.advanceAmountPaid']}
                  invalid={!!monthlyFixedRequestErrorMap['paymentDetails.advanceAmountPaid']}
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
              disabled={Object.values(apiErrors).some(error => error !== '')}
              loading={submitButtonLoading}
            >
              {isEditing ? 'Update' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateMonthlyFixedRequest