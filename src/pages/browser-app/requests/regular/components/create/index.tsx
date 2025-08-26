import { Breadcrumb, Text, Panel, Row, Column, TextInput, SelectInput, RadioGroup, CheckBox, TextArea, Button, Alert, Modal, ConfirmationPopup, Toggle, ReadOnlyText } from '@base'
import { RegularRequestModel } from '@types'
import { bemClass, validatePayload, nameToPath, formatDateTimeForInput, parseDateTimeFromInput } from '@utils'
import React, { FunctionComponent, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateRegularRequestMutation } from '@api/queries/regular-request'
import { useCustomerByCategory } from '@api/queries/customer'
import { useVehicleByCategory } from '@api/queries/vehicle'
import { useStaffByCategory } from '@api/queries/staff'
import { usePackageByCategory } from '@api/queries/package'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

import './style.scss'

const blk = 'create-regular-request'

interface CreateRegularRequestProps {}

const CreateRegularRequest: FunctionComponent<CreateRegularRequestProps> = () => {
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

  const sampleRegularRequestModel: RegularRequestModel = {
    customerType: 'existing',
    vehicleType: 'existing',
    staffType: 'existing',
    requestType: '',

    customerCategory: null,
    customer: null,
    customerDetails: null,
    vehicleCategory: null,
    vehicle: null,
    vehicleDetails: null,
    ac: false,
    packageCategory: null,
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
      advancedToCustomer: '',
    },
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

  // API queries
  const { data: customers, error: customersError, isLoading: customersLoading, isError: customersIsError } = useCustomerByCategory(customerCategoryPath)

  const { data: vehicles, error: vehiclesError, isLoading: vehiclesLoading, isError: vehiclesIsError } = useVehicleByCategory(vehicleCategoryPath)

  const { data: staffMembers, error: staffError, isLoading: staffLoading, isError: staffIsError } = useStaffByCategory(staffCategoryPath)

  const { data: packages, error: packagesError, isLoading: packagesLoading, isError: packagesIsError } = usePackageByCategory(packageCategoryPath)

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New regular request created successfully!')

  const [customerOptions, setCustomerOptions] = useState<{ key: any; value: any }[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<{ key: any; value: any }[]>([])
  const [staffOptions, setStaffOptions] = useState<{ key: any; value: any }[]>([])
  const [packageOptions, setPackageOptions] = useState<{ key: any; value: any }[]>([])

  // API Error states
  const [apiErrors, setApiErrors] = useState({
    customers: '',
    vehicles: '',
    staff: '',
    packages: '',
  })

  // Generic function to handle API responses and errors
  const handleApiResponse = (
    data: any,
    error: any,
    isError: boolean,
    errorKey: 'customers' | 'vehicles' | 'staff' | 'packages',
    setOptions: React.Dispatch<React.SetStateAction<{ key: any; value: any }[]>>,
    mapFunction: (item: any) => { key: any; value: any },
  ) => {
    if (isError) {
      const userFriendlyMessages = {
        customers: 'Unable to load customer data. Please check your connection and try again.',
        vehicles: 'Unable to load vehicle data. Please check your connection and try again.',
        staff: 'Unable to load staff data. Please check your connection and try again.',
        packages: 'Unable to load package information. Please check your connection and try again.',
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

  // Generate options for SelectInput based on loading/error states
  const getSelectOptions = (isLoading: boolean, isError: boolean, options: { key: any; value: any }[], loadingText: string, errorText: string, noDataText: string) => {
    if (isLoading) return [{ key: 'loading', value: loadingText }]
    if (isError) return [{ key: 'error', value: errorText }]
    if (options.length > 0) return options
    return [{ key: 'no-data', value: noDataText }]
  }

  // Check if a value should be ignored in change handlers
  const isPlaceholderValue = (value: string, type: 'customers' | 'vehicles' | 'staff' | 'packages') => {
    const placeholders = {
      customers: ['Please wait...', 'Unable to load options', 'No customers found'],
      vehicles: ['Please wait...', 'Unable to load options', 'No vehicles found'],
      staff: ['Please wait...', 'Unable to load options', 'No staff found'],
      packages: ['Please wait...', 'Unable to load options', 'No packages found'],
    }
    return placeholders[type].includes(value)
  }

  const [errorMap, setErrorMap] = useState<Record<string, any>>({})
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
    handleApiResponse(staffMembers, staffError, staffIsError, 'staff', setStaffOptions, (staffMember: { _id: any; name: any }) => ({
      key: staffMember._id,
      value: staffMember.name,
    }))
  }, [staffMembers, staffError, staffIsError])

  React.useEffect(() => {
    handleApiResponse(packages, packagesError, packagesIsError, 'packages', setPackageOptions, (pkg: { _id: any; packageCode: any }) => ({ key: pkg._id, value: pkg.packageCode }))
  }, [packages, packagesError, packagesIsError])

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

    const validationSchema = createValidationSchema(regularRequest)
    const { isValid, errorMap } = validatePayload(validationSchema, regularRequest)

    setIsValidationError(!isValid)
    setErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        await createRegularRequest.mutateAsync(regularRequest)
        setConfirmationPopUpType('create')
        setConfirmationPopUpTitle('Success')
        setConfirmationPopUpSubtitle('New Regular Request created successfully!')

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to create regular request', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Error')
        setConfirmationPopUpSubtitle('Unable to create regular request. Please try again.')
        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      }
    } else {
      console.log('Create Regular Request: Validation Error', errorMap)
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
            New Regular Request
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
                label: 'New Regular Request',
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
        {(apiErrors.customers || apiErrors.vehicles || apiErrors.staff || apiErrors.packages) && (
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
                  options={['existing', 'new']}
                  value={regularRequest.customerType}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      customerType: value.customerType as 'existing' | 'new',
                      customerCategory: value.customerType === 'new' ? null : regularRequest.customerCategory,
                      customer: value.customerType === 'new' ? null : regularRequest.customer,
                      customerDetails: value.customerType === 'existing' ? null : { name: '', contact: '', email: '' },
                    })
                  }}
                  direction="horizontal"
                  required
                  errorMessage={errorMap['customerType']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Vehicle Type"
                  name="vehicleType"
                  options={['existing', 'new']}
                  value={regularRequest.vehicleType}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      vehicleType: value.vehicleType as 'existing' | 'new',
                      vehicleCategory: value.vehicleType === 'new' ? null : regularRequest.vehicleCategory,
                      vehicle: value.vehicleType === 'new' ? null : regularRequest.vehicle,
                      vehicleDetails: value.vehicleType === 'existing' ? null : { ownerName: '', ownerContact: '', ownerEmail: '', manufacturer: '', name: '', registrationNo: '' },
                    })
                  }}
                  direction="horizontal"
                  required
                  errorMessage={errorMap['vehicleType']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Staff Type"
                  name="staffType"
                  options={['existing', 'new']}
                  value={regularRequest.staffType}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      staffType: value.staffType as 'existing' | 'new',
                      staffCategory: value.staffType === 'new' ? null : regularRequest.staffCategory,
                      staff: value.staffType === 'new' ? null : regularRequest.staff,
                      staffDetails: value.staffType === 'existing' ? null : { name: '', contact: '', license: '' },
                    })
                  }}
                  direction="horizontal"
                  required
                  errorMessage={errorMap['staffType']}
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
                  errorMessage={errorMap['requestType']}
                  invalid={errorMap['requestType']}
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
                  errorMessage={errorMap['pickUpLocation']}
                  invalid={errorMap['pickUpLocation']}
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
                  errorMessage={errorMap['dropOffLocation']}
                  invalid={errorMap['dropOffLocation']}
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
                  errorMessage={errorMap['pickUpDateTime']}
                  invalid={errorMap['pickUpDateTime']}
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
                  errorMessage={errorMap['dropDateTime']}
                  invalid={errorMap['dropDateTime']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'read-only'])}
              >
                <ReadOnlyText
                  label="Duration"
                  value={calculateDateTimeDifference(regularRequest.pickUpDateTime, regularRequest.dropDateTime)}
                  color="success"
                  size='jumbo'
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
                  errorMessage={errorMap['openingKm']}
                  invalid={errorMap['openingKm']}
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
                  errorMessage={errorMap['closingKm']}
                  invalid={errorMap['closingKm']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'read-only'])}
              >
                <ReadOnlyText
                  label="Total Distance"
                  value={calculateKmDifference(regularRequest.openingKm, regularRequest.closingKm)}
                  color="success"
                  size='jumbo'
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
                  options={['Yes', 'No']}
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
                    errorMessage={errorMap['customerCategory']}
                    invalid={errorMap['customerCategory']}
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
                    errorMessage={errorMap['customer']}
                    invalid={errorMap['customer']}
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
                    errorMessage={errorMap['customerDetails.name']}
                    invalid={errorMap['customerDetails.name']}
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
                    errorMessage={errorMap['customerDetails.contact']}
                    invalid={errorMap['customerDetails.contact']}
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
                    errorMessage={errorMap['customerDetails.email']}
                    invalid={errorMap['customerDetails.email']}
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
                        vehicle: null,
                      })
                    }}
                    required
                    errorMessage={errorMap['vehicleCategory']}
                    invalid={errorMap['vehicleCategory']}
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
                    errorMessage={errorMap['vehicle']}
                    invalid={errorMap['vehicle']}
                    disabled={!regularRequest.vehicleCategory || vehiclesLoading || vehiclesIsError}
                  />
                </Column>
              </Row>
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
                      errorMessage={errorMap['vehicleDetails.ownerName']}
                      invalid={errorMap['vehicleDetails.ownerName']}
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
                      errorMessage={errorMap['vehicleDetails.ownerContact']}
                      invalid={errorMap['vehicleDetails.ownerContact']}
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
                      errorMessage={errorMap['vehicleDetails.ownerEmail']}
                      invalid={errorMap['vehicleDetails.ownerEmail']}
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
                      errorMessage={errorMap['vehicleDetails.manufacturer']}
                      invalid={errorMap['vehicleDetails.manufacturer']}
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
                      errorMessage={errorMap['vehicleDetails.name']}
                      invalid={errorMap['vehicleDetails.name']}
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
                      errorMessage={errorMap['vehicleDetails.registrationNo']}
                      invalid={errorMap['vehicleDetails.registrationNo']}
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
                    errorMessage={errorMap['staffCategory']}
                    invalid={errorMap['staffCategory']}
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
                    errorMessage={errorMap['staff']}
                    invalid={errorMap['staff']}
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
                    errorMessage={errorMap['staffDetails.name']}
                    invalid={errorMap['staffDetails.name']}
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
                    errorMessage={errorMap['staffDetails.contact']}
                    invalid={errorMap['staffDetails.contact']}
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
                    errorMessage={errorMap['staffDetails.license']}
                    invalid={errorMap['staffDetails.license']}
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
                  errorMessage={errorMap['packageCategory']}
                  invalid={errorMap['packageCategory']}
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
                  errorMessage={errorMap['package']}
                  invalid={errorMap['package']}
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
                  errorMessage={errorMap['otherCharges.toll.amount']}
                  invalid={errorMap['otherCharges.toll.amount']}
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
                  errorMessage={errorMap['otherCharges.parking.amount']}
                  invalid={errorMap['otherCharges.parking.amount']}
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
                  errorMessage={errorMap['otherCharges.nightHalt.amount']}
                  invalid={errorMap['otherCharges.nightHalt.amount']}
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
                  errorMessage={errorMap['otherCharges.driverAllowance.amount']}
                  invalid={errorMap['otherCharges.driverAllowance.amount']}
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
                  required
                  errorMessage={errorMap['advancedPayment.advancedFromCustomer']}
                  invalid={errorMap['advancedPayment.advancedFromCustomer']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Advanced to Customer"
                  name="advancedToCustomer"
                  type="number"
                  value={regularRequest.advancedPayment.advancedToCustomer ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      advancedPayment: {
                        ...regularRequest.advancedPayment,
                        advancedToCustomer: value.advancedToCustomer ? Number(value.advancedToCustomer) : '',
                      },
                    })
                  }}
                  required
                  errorMessage={errorMap['advancedPayment.advancedToCustomer']}
                  invalid={errorMap['advancedPayment.advancedToCustomer']}
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
                  errorMessage={errorMap['paymentDetails.status']}
                  invalid={errorMap['paymentDetails.status']}
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
                  errorMessage={errorMap['paymentDetails.paymentMethod']}
                  invalid={errorMap['paymentDetails.paymentMethod']}
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
                  errorMessage={errorMap['paymentDetails.paymentDate']}
                  invalid={errorMap['paymentDetails.paymentDate']}
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
              Submit
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
