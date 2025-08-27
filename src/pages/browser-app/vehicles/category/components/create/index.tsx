import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { Breadcrumb, Text, Panel, Row, Column, TextInput, CheckBox, Button, SelectInput, TextArea, ConfirmationPopup, Modal, Alert, Toggle } from '@base'
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

// Interface for the API response which contains full objects instead of just IDs
interface VehicleResponseModel extends Omit<VehicleModel, 'monthlyFixedDetails'> {
  _id: string
  monthlyFixedDetails?: {
    customerCategory: string | null
    customer: CustomerModel | string | null // Can be either full object or just ID
    packageCategory: string | null
    package: PackageModel | string | null // Can be either full object or just ID
    staffCategory: string | null
    staff: StaffModel | string | null // Can be either full object or just ID
    contractStartDate: Date | null
    contractEndDate: Date | null
  }
}

interface CreateVehicleProps {
  category?: string
}

const CreateVehicle: FunctionComponent<CreateVehicleProps> = ({ category = '' }) => {
  const sampleVehicleModel: VehicleModel = {
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
  }
  const navigate = useNavigate()
  const params = useParams()
  const createVehicle = useCreateVehicleMutation()
  const updateVehicle = useUpdateVehicleMutation()

  const { data: vehicleDataResponse, isLoading, error: getVehicleDataError } = useVehicleByIdQuery(params.id || '')

  const [vehicle, setVehicle] = useState<VehicleModel>(sampleVehicleModel)

  const customerCategoryPath = useMemo(() => {
    return vehicle.isMonthlyFixed && vehicle.monthlyFixedDetails?.customerCategory ? nameToPath(vehicle.monthlyFixedDetails.customerCategory) : ''
  }, [vehicle.isMonthlyFixed, vehicle.monthlyFixedDetails?.customerCategory])

  const packageCategoryPath = useMemo(() => {
    return vehicle.isMonthlyFixed && vehicle.monthlyFixedDetails?.packageCategory ? nameToPath(vehicle.monthlyFixedDetails.packageCategory) : ''
  }, [vehicle.isMonthlyFixed, vehicle.monthlyFixedDetails?.packageCategory])

  const staffCategoryPath = useMemo(() => {
    return vehicle.isMonthlyFixed && vehicle.monthlyFixedDetails?.staffCategory ? nameToPath(vehicle.monthlyFixedDetails.staffCategory) : ''
  }, [vehicle.isMonthlyFixed, vehicle.monthlyFixedDetails?.staffCategory])

  // Only fetch customers when monthly fixed is enabled for the vehicle and a category is selected
  const { data: customers, error: customersError, isLoading: customersLoading, isError: customersIsError } = useCustomerByCategory(customerCategoryPath)

  // Only fetch packages when monthly fixed is enabled for the vehicle and a category is selected
  const { data: packages, error: packagesError, isLoading: packagesLoading, isError: packagesIsError } = usePackageByCategory(packageCategoryPath)

  // Only fetch staff when monthly fixed is enabled for the vehicle and a category is selected
  const { data: staff, error: staffError, isLoading: staffLoading, isError: staffIsError } = useStaffByCategory(staffCategoryPath)

  const [isEditing, setIsEditing] = useState(false)
  const [vehicleId, setVehicleId] = useState('')

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New user role created successfully!')

  const [customerOptions, setCustomerOptions] = useState<{ key: any; value: any }[]>([])
  const [packageOptions, setPackageOptions] = useState<{ key: any; value: any }[]>([])
  const [staffOptions, setStaffOptions] = useState<{ key: any; value: any }[]>([])

  // API Error states
  const [apiErrors, setApiErrors] = useState({
    customers: '',
    packages: '',
    staff: '',
  })

  const loadDataFromResponse = (response: VehicleResponseModel) => {
    // Helper function to extract ID from either an object or a string
    const extractId = (field: any): string => {
      if (typeof field === 'string') {
        return field // Already an ID
      }
      if (field && typeof field === 'object' && field._id) {
        return field._id // Extract _id from object
      }
      return '' // Fallback to empty string
    }

    setVehicle({
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
            // Extract customer _id if response contains full customer object
            customer: extractId(response.monthlyFixedDetails.customer),
            packageCategory: response.monthlyFixedDetails.packageCategory || '',
            // Extract package _id if response contains full package object
            package: extractId(response.monthlyFixedDetails.package),
            staffCategory: response.monthlyFixedDetails.staffCategory || '',
            // Extract staff _id if response contains full staff object
            staff: extractId(response.monthlyFixedDetails.staff),
            contractStartDate: response.monthlyFixedDetails.contractStartDate ? new Date(response.monthlyFixedDetails.contractStartDate) : null,
            contractEndDate: response.monthlyFixedDetails.contractEndDate ? new Date(response.monthlyFixedDetails.contractEndDate) : null,
          }
        : null,
      category: response.category || '',
      isActive: response.isActive !== undefined ? response.isActive : true,
      comments: response.comments || '',
    })
  }

  useEffect(() => {
    if (vehicleDataResponse) {
      loadDataFromResponse(vehicleDataResponse)
      setIsEditing(true)
      setVehicleId(params.id || '')
    }
  }, [vehicleDataResponse])

  // Generic function to handle API responses and errors
  const handleApiResponse = (
    data: any,
    error: any,
    isError: boolean,
    errorKey: 'customers' | 'packages' | 'staff',
    setOptions: React.Dispatch<React.SetStateAction<{ key: any; value: any }[]>>,
    mapFunction: (item: any) => { key: any; value: any },
  ) => {
    if (isError) {
      const userFriendlyMessages = {
        customers: 'Unable to load customer data. Please check your connection and try again.',
        packages: 'Unable to load package information. Please check your connection and try again.',
        staff: 'Unable to load staff data. Please check your connection and try again.',
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
  const isPlaceholderValue = (value: string, type: 'customers' | 'packages' | 'staff') => {
    const placeholders = {
      customers: ['Please wait...', 'Unable to load options', 'No customers found'],
      packages: ['Please wait...', 'Unable to load options', 'No packages found'],
      staff: ['Please wait...', 'Unable to load options', 'No staff found'],
    }
    return placeholders[type].includes(value)
  }

  // Unified function to update monthly fixed details
  const updateMonthlyFixedDetails = (updates: Partial<any>) => {
    setVehicle(prev => ({
      ...prev,
      monthlyFixedDetails: {
        customerCategory: prev.monthlyFixedDetails?.customerCategory ?? '',
        customer: prev.monthlyFixedDetails?.customer ?? '',
        packageCategory: prev.monthlyFixedDetails?.packageCategory ?? '',
        package: prev.monthlyFixedDetails?.package ?? '',
        staffCategory: prev.monthlyFixedDetails?.staffCategory ?? '',
        staff: prev.monthlyFixedDetails?.staff ?? '',
        contractStartDate: prev.monthlyFixedDetails?.contractStartDate ?? null,
        contractEndDate: prev.monthlyFixedDetails?.contractEndDate ?? null,
        ...updates,
      },
    }))
  }

  const [errorMap, setErrorMap] = useState<Record<string, any>>(sampleVehicleModel)
  const [isValidationError, setIsValidationError] = useState(false)

  useEffect(() => {
    handleApiResponse(customers, customersError, customersIsError, 'customers', setCustomerOptions, (customer: { _id: any; name: any }) => ({
      key: customer._id,
      value: customer.name,
    }))

    // Debug: Check if the saved customer ID matches any loaded customers
    if (customers?.data?.length > 0 && vehicle.monthlyFixedDetails?.customer) {
      const savedCustomerId = vehicle.monthlyFixedDetails.customer
      const matchingCustomer = customers.data.find((c: any) => c._id === savedCustomerId)
      console.log('Customer matching check:', {
        savedCustomerId,
        matchingCustomer: matchingCustomer ? { id: matchingCustomer._id, name: matchingCustomer.name } : null,
        allCustomerIds: customers.data.map((c: any) => c._id),
      })
    }
  }, [customers, customersError, customersIsError, vehicle.monthlyFixedDetails?.customer])

  useEffect(() => {
    handleApiResponse(packages, packagesError, packagesIsError, 'packages', setPackageOptions, (pkg: { _id: any; packageCode: any }) => ({ key: pkg._id, value: pkg.packageCode }))
  }, [packages, packagesError, packagesIsError])

  useEffect(() => {
    handleApiResponse(staff, staffError, staffIsError, 'staff', setStaffOptions, (staffMember: { _id: any; name: any }) => ({ key: staffMember._id, value: staffMember.name }))
  }, [staff, staffError, staffIsError])

  const navigateBack = () => {
    // Route to the VehicleList page
    navigate(`/vehicles/${category}`)
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

    const validationSchema = createValidationSchema(vehicle)
    const { isValid, errorMap } = validatePayload(validationSchema, vehicle)
    const dataToSave = { ...vehicle, monthlyFixedDetails: vehicle.isMonthlyFixed ? vehicle.monthlyFixedDetails : null }
    setIsValidationError(!isValid)
    setErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        if (isEditing) {
          await updateVehicle.mutateAsync({ _id: vehicleId, ...dataToSave })
          setConfirmationPopUpType('update')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('Vehicle updated successfully!')
        } else {
          await createVehicle.mutateAsync({ ...dataToSave, category: nameToPath(category) })
          setConfirmationPopUpType('create')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('New Vehicle created successfully!')
        }

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to create/update vehicle', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Error')
        setConfirmationPopUpSubtitle(`Unable to ${isEditing ? 'update' : 'create'} vehicle. Please try again.`)
        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      }
    } else {
      console.log('Create Vehicle: Validation Error', errorMap)
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
            {`${isEditing ? 'Edit' : 'New'} ${pathToName(category)} Vehicle`}
          </Text>
          <Breadcrumb
            data={[
              {
                label: 'Home',
                route: '/dashboard',
              },
              {
                label: `${pathToName(category)} Vehicles`,
                route: `/vehicles/${category}`,
              },
              {
                label: `${isEditing ? 'Edit' : 'New'} ${pathToName(category)} Vehicle`,
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
        {(apiErrors.customers || apiErrors.packages || apiErrors.staff) && (
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
                    title="Vehicle Details"
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <Row>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <ConfiguredInput
                          label="Vehicle Type"
                          name="type"
                          configToUse="Vehicle type"
                          type={CONFIGURED_INPUT_TYPES.SELECT}
                          value={vehicle.type}
                          changeHandler={value => {
                            setVehicle({
                              ...vehicle,
                              type: value.type?.toString() ?? '',
                            })
                          }}
                          required
                          errorMessage={errorMap['type']}
                          invalid={errorMap['type']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Manufacturer"
                          name="manufacturer"
                          value={vehicle.manufacturer}
                          changeHandler={value => {
                            setVehicle({
                              ...vehicle,
                              manufacturer: value.manufacturer?.toString() ?? '',
                            })
                          }}
                          required
                          errorMessage={errorMap['manufacturer']}
                          invalid={errorMap['manufacturer']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Vehicle Name"
                          name="name"
                          value={vehicle.name}
                          changeHandler={value => {
                            setVehicle({
                              ...vehicle,
                              name: value.name?.toString() ?? '',
                            })
                          }}
                          required
                          errorMessage={errorMap['name']}
                          invalid={errorMap['name']}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Number of Seats"
                          name="noOfSeats"
                          type="number"
                          value={vehicle.noOfSeats ?? ''}
                          changeHandler={value => {
                            setVehicle({
                              ...vehicle,
                              noOfSeats: value.noOfSeats ? Number(value.noOfSeats) : '',
                            })
                          }}
                          required
                          errorMessage={errorMap['noOfSeats']}
                          invalid={errorMap['noOfSeats']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Registration Number"
                          name="registrationNo"
                          value={vehicle.registrationNo}
                          changeHandler={value => {
                            setVehicle({
                              ...vehicle,
                              registrationNo: value.registrationNo?.toString() ?? '',
                            })
                          }}
                          required
                          errorMessage={errorMap['registrationNo']}
                          invalid={errorMap['registrationNo']}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <Toggle
                          name="hasAc"
                          label="Is AC Required"
                          checked={vehicle.hasAc}
                          changeHandler={obj => {
                            setVehicle({
                              ...vehicle,
                              hasAc: !!obj.hasAc,
                            })
                          }}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <Toggle
                          name="isMonthlyFixed"
                          label="Is Monthly Fixed"
                          checked={vehicle.isMonthlyFixed}
                          changeHandler={obj =>
                            setVehicle({
                              ...vehicle,
                              isMonthlyFixed: !!obj.isMonthlyFixed,
                            })
                          }
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
                          <Column
                            col={4}
                            className={bemClass([blk, 'margin-bottom'])}
                          >
                            <ConfiguredInput
                              label="Customer category"
                              configToUse="Customer category"
                              type={CONFIGURED_INPUT_TYPES.SELECT}
                              name="customerCategory"
                              value={vehicle.monthlyFixedDetails?.customerCategory || ''}
                              changeHandler={value => {
                                updateMonthlyFixedDetails({
                                  customerCategory: value.customerCategory?.toString() ?? '',
                                  customer: '', // Reset customer when category changes
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={errorMap['monthlyFixedDetails.customerCategory']}
                              invalid={errorMap['monthlyFixedDetails.customerCategory']}
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
                              value={
                                vehicle.monthlyFixedDetails?.customer
                                  ? ((customerOptions.find((option: any) => option.key === vehicle.monthlyFixedDetails?.customer) as any)?.value ?? '')
                                  : ''
                              }
                              changeHandler={value => {
                                if (isPlaceholderValue(value.customer?.toString() || '', 'customers')) return

                                const selectedOption = customerOptions.find((option: any) => option.value === value.customer) as any
                                updateMonthlyFixedDetails({ customer: selectedOption?.key ?? '' })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={errorMap['monthlyFixedDetails.customer']}
                              invalid={errorMap['monthlyFixedDetails.customer']}
                              disabled={!vehicle.monthlyFixedDetails?.customerCategory || customersLoading || customersIsError}
                            />
                          </Column>
                        </Row>
                      </Panel>

                      <Panel
                        title="Monthly Fixed Package Details"
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
                              value={vehicle.monthlyFixedDetails?.packageCategory ?? ''}
                              configToUse="Package category"
                              type={CONFIGURED_INPUT_TYPES.SELECT}
                              changeHandler={value => {
                                updateMonthlyFixedDetails({
                                  packageCategory: value.packageCategory?.toString() ?? '',
                                  package: '', // Reset package when category changes
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={errorMap['monthlyFixedDetails.packageCategory']}
                              invalid={errorMap['monthlyFixedDetails.packageCategory']}
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
                              value={
                                vehicle.monthlyFixedDetails?.package && packageOptions.length > 0
                                  ? ((packageOptions.find((option: any) => option.key === vehicle.monthlyFixedDetails?.package) as any)?.value ?? '')
                                  : (vehicle.monthlyFixedDetails?.package ?? '')
                              }
                              changeHandler={value => {
                                if (isPlaceholderValue(value.package?.toString() || '', 'packages')) return

                                const selectedOption = packageOptions.find((option: any) => option.value === value.package) as any
                                updateMonthlyFixedDetails({ package: selectedOption?.key ?? '' })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={errorMap['monthlyFixedDetails.package']}
                              invalid={errorMap['monthlyFixedDetails.package']}
                              disabled={!vehicle.monthlyFixedDetails?.packageCategory || packagesLoading || packagesIsError}
                            />
                          </Column>
                        </Row>
                      </Panel>

                      <Panel
                        title="Monthly Fixed Staff Details"
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
                              value={vehicle.monthlyFixedDetails?.staffCategory ?? ''}
                              configToUse="Staff category"
                              type={CONFIGURED_INPUT_TYPES.SELECT}
                              changeHandler={value => {
                                updateMonthlyFixedDetails({
                                  staffCategory: value.staffCategory?.toString() ?? '',
                                  staff: '', // Reset staff when category changes
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={errorMap['monthlyFixedDetails.staffCategory']}
                              invalid={errorMap['monthlyFixedDetails.staffCategory']}
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
                              value={
                                vehicle.monthlyFixedDetails?.staff && staffOptions.length > 0
                                  ? ((staffOptions.find((option: any) => option.key === vehicle.monthlyFixedDetails?.staff) as any)?.value ?? '')
                                  : (vehicle.monthlyFixedDetails?.staff ?? '')
                              }
                              changeHandler={value => {
                                if (isPlaceholderValue(value.staff?.toString() || '', 'staff')) return

                                const selectedOption = staffOptions.find((option: any) => option.value === value.staff) as any
                                updateMonthlyFixedDetails({ staff: selectedOption?.key ?? '' })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={errorMap['monthlyFixedDetails.staff']}
                              invalid={errorMap['monthlyFixedDetails.staff']}
                              disabled={!vehicle.monthlyFixedDetails?.staffCategory || staffLoading || staffIsError}
                            />
                          </Column>
                        </Row>
                      </Panel>

                      <Panel
                        title="Monthly Fixed Contract Details"
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <Row>
                          <Column
                            col={4}
                            className={bemClass([blk, 'margin-bottom'])}
                          >
                            <TextInput
                              label="Contract Start Date"
                              name="contractStartDate"
                              type="date"
                              value={vehicle.monthlyFixedDetails?.contractStartDate ? new Date(vehicle.monthlyFixedDetails.contractStartDate).toISOString().slice(0, 10) : ''}
                              changeHandler={value => {
                                updateMonthlyFixedDetails({
                                  contractStartDate: value.contractStartDate ? new Date(value.contractStartDate) : null,
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={errorMap['monthlyFixedDetails.contractStartDate']}
                              invalid={errorMap['monthlyFixedDetails.contractStartDate']}
                            />
                          </Column>
                          <Column
                            col={4}
                            className={bemClass([blk, 'margin-bottom'])}
                          >
                            <TextInput
                              label="Contract End Date"
                              name="contractEndDate"
                              type="date"
                              value={vehicle.monthlyFixedDetails?.contractEndDate ? new Date(vehicle.monthlyFixedDetails.contractEndDate).toISOString().slice(0, 10) : ''}
                              changeHandler={value => {
                                updateMonthlyFixedDetails({
                                  contractEndDate: value.contractEndDate ? new Date(value.contractEndDate) : null,
                                })
                              }}
                              required={vehicle.isMonthlyFixed}
                              errorMessage={errorMap['monthlyFixedDetails.contractEndDate']}
                              invalid={errorMap['monthlyFixedDetails.contractEndDate']}
                            />
                          </Column>
                        </Row>
                      </Panel>
                    </>
                  )}

                  <Panel
                    title="Comments"
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextArea
                      className={bemClass([blk, 'margin-bottom'])}
                      name="comments"
                      value={vehicle.comments}
                      changeHandler={value => {
                        setVehicle({
                          ...vehicle,
                          comments: value.comments?.toString() ?? '',
                        })
                      }}
                      placeholder="Enter any additional comments or notes here..."
                    />
                  </Panel>
                  <Panel
                    title="Is active"
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <Row>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <Toggle
                          name="isActive"
                          checked={vehicle.isActive}
                          changeHandler={obj => {
                            setVehicle({
                              ...vehicle,
                              isActive: !!obj.isActive,
                            })
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
                      clickHandler={submitHandler}
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

export default CreateVehicle
