import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { Breadcrumb, Text, Panel, Row, Column, TextInput, CheckBox, Button, SelectInput, TextArea, ConfirmationPopup, Modal, Alert, Toggle } from '@base'
import { ExpenseModel } from '@types'
import { bemClass, nameToPath, pathToName, validatePayload } from '@utils'

import './style.scss'
import { useNavigate } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateExpenseMutation, useUpdateExpenseMutation } from '@api/queries/expense'
import { useVehicleByCategory } from '@api/queries/vehicle'
import { useStaffByCategory } from '@api/queries/staff'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

const blk = 'create-expense'

interface CreateExpenseProps {
  category?: string
}

const CreateExpense: FunctionComponent<CreateExpenseProps> = ({ category = '' }) => {
  const sampleExpenseModel: ExpenseModel = {
    type: '',
    paymentMethod: '',
    date: null,
    amount: '', // Initialize as empty string like noOfSeats
    location: '',
    vehicleCategory: category === 'vehicle' ? '' : null,
    vehicle: category === 'vehicle' ? '' : null,
    staffCategory: category === 'staff' ? '' : null,
    staff: category === 'staff' ? '' : null,
    comment: '',
    category: nameToPath(category),
  }

  const navigate = useNavigate()
  const createExpense = useCreateExpenseMutation()
  const updateExpense = useUpdateExpenseMutation()

  const [expense, setExpense] = useState<ExpenseModel>(sampleExpenseModel)
  
  // Vehicle category path for API queries
  const vehicleCategoryPath = useMemo(() => {
    return category === 'vehicle' && expense.vehicleCategory
      ? nameToPath(expense.vehicleCategory)
      : ''
  }, [category, expense.vehicleCategory])

  // Staff category path for API queries  
  const staffCategoryPath = useMemo(() => {
    return category === 'staff' && expense.staffCategory
      ? nameToPath(expense.staffCategory)
      : ''
  }, [category, expense.staffCategory])

  // Fetch vehicles by category when vehicle category is selected
  const {
    data: vehicles,
    error: vehiclesError,
    isLoading: vehiclesLoading,
    isError: vehiclesIsError
  } = useVehicleByCategory(vehicleCategoryPath)

  // Fetch staff by category when staff category is selected
  const {
    data: staffMembers,
    error: staffError,
    isLoading: staffLoading,
    isError: staffIsError
  } = useStaffByCategory(staffCategoryPath)

  const [isEditing, setIsEditing] = useState(false)
  const [expenseId, setExpenseId] = useState('')

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New expense created successfully!')

  const [vehicleOptions, setVehicleOptions] = useState<{ key: any; value: any }[]>([])
  const [staffOptions, setStaffOptions] = useState<{ key: any; value: any }[]>([])

  // API Error states
  const [apiErrors, setApiErrors] = useState({
    vehicles: '',
    staff: ''
  })

  // Generic function to handle API responses and errors
  const handleApiResponse = (
    data: any,
    error: any,
    isError: boolean,
    errorKey: 'vehicles' | 'staff',
    setOptions: React.Dispatch<React.SetStateAction<{ key: any; value: any }[]>>,
    mapFunction: (item: any) => { key: any; value: any }
  ) => {
    if (isError) {
      const userFriendlyMessages = {
        vehicles: 'Unable to load vehicle data. Please check your connection and try again.',
        staff: 'Unable to load staff data. Please check your connection and try again.'
      }
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: userFriendlyMessages[errorKey]
      }))
      setOptions([])
    } else if (data?.data?.length > 0) {
      const options = data.data.map(mapFunction)
      setOptions(options)
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }))
    } else {
      setOptions([])
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }))
    }
  }

  // Generate options for SelectInput based on loading/error states
  const getSelectOptions = (
    isLoading: boolean,
    isError: boolean,
    options: { key: any; value: any }[],
    loadingText: string,
    errorText: string,
    noDataText: string
  ) => {
    if (isLoading) return [{ key: 'loading', value: loadingText }]
    if (isError) return [{ key: 'error', value: errorText }]
    if (options.length > 0) return options
    return [{ key: 'no-data', value: noDataText }]
  }

  // Check if a value should be ignored in change handlers
  const isPlaceholderValue = (value: string, type: 'vehicles' | 'staff') => {
    const placeholders = {
      vehicles: ['Please wait...', 'Unable to load options', 'No vehicles found'],
      staff: ['Please wait...', 'Unable to load options', 'No staff found']
    }
    return placeholders[type].includes(value)
  }

  // Unified function to update vehicle details
  const updateVehicleDetails = (updates: Partial<Pick<ExpenseModel, 'vehicleCategory' | 'vehicle'>>) => {
    setExpense(prev => ({
      ...prev,
      ...updates
    }))
  }

  // Unified function to update staff details
  const updateStaffDetails = (updates: Partial<Pick<ExpenseModel, 'staffCategory' | 'staff'>>) => {
    setExpense(prev => ({
      ...prev,
      ...updates
    }))
  }

  const [errorMap, setErrorMap] = useState<Record<string, any>>(sampleExpenseModel)
  const [isValidationError, setIsValidationError] = useState(false)

  useEffect(() => {
    if (category === 'vehicle') {
      handleApiResponse(
        vehicles,
        vehiclesError,
        vehiclesIsError,
        'vehicles',
        setVehicleOptions,
        (vehicle: { _id: any; name: any }) => ({ key: vehicle._id, value: vehicle.name })
      )
    }
  }, [vehicles, vehiclesError, vehiclesIsError, category])

  useEffect(() => {
    if (category === 'staff') {
      handleApiResponse(
        staffMembers,
        staffError,
        staffIsError,
        'staff',
        setStaffOptions,
        (staffMember: { _id: any; name: any }) => ({ key: staffMember._id, value: staffMember.name })
      )
    }
  }, [staffMembers, staffError, staffIsError, category])

  const navigateBack = () => {
    navigate(`/expenses/${category}`)
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

    const validationSchema = createValidationSchema(expense)
    const { isValid, errorMap } = validatePayload(validationSchema, expense)

    setIsValidationError(!isValid)
    setErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        if (isEditing) {
          // await updateExpense.mutateAsync({ _id: expenseId, ...expense })
          setConfirmationPopUpType('update')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('Expense updated successfully!')
        } else {
          await createExpense.mutateAsync({ ...expense, category: nameToPath(category) })
          setConfirmationPopUpType('create')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('New Expense created successfully!')
        }

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to create/update expense', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Error')
        setConfirmationPopUpSubtitle(`Unable to ${isEditing ? 'update' : 'create'} expense. Please try again.`)
        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      }
    } else {
      console.log('Create Expense: Validation Error', errorMap)
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
            {`${isEditing ? 'Edit' : 'New'} ${pathToName(category)} Expense`}
          </Text>
          <Breadcrumb
            data={[
              {
                label: 'Home',
                route: '/dashboard',
              },
              {
                label: `${pathToName(category)} Expenses`,
                route: `/expenses/${category}`,
              },
              {
                label: `${isEditing ? 'Edit' : 'New'} ${pathToName(category)} Expense`,
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
        {(apiErrors.vehicles || apiErrors.staff) && (
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
                    setExpense({
                      ...expense,
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
                <ConfiguredInput
                  label="Payment Mode"
                  name="paymentMethod"
                  configToUse='Payment method'
                  type={CONFIGURED_INPUT_TYPES.SELECT}
                  value={expense.paymentMethod}
                  changeHandler={value => {
                    setExpense({
                      ...expense,
                      paymentMethod: value.paymentMethod?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['paymentMethod']}
                  invalid={errorMap['paymentMethod']}
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
                    setExpense({
                      ...expense,
                      date: value.date ? new Date(value.date) : null,
                    })
                  }}
                  required
                  errorMessage={errorMap['date']}
                  invalid={errorMap['date']}
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
                    setExpense({
                      ...expense,
                      amount: value.amount ? Number(value.amount) : '',
                    })
                  }}
                  required
                  errorMessage={errorMap['amount']}
                  invalid={errorMap['amount']}
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
                    setExpense({
                      ...expense,
                      location: value.location?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['location']}
                  invalid={errorMap['location']}
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
                      updateVehicleDetails({
                        vehicleCategory: value.vehicleCategory?.toString() ?? '',
                        vehicle: '' // Reset vehicle when category changes
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
                    options={getSelectOptions(
                      vehiclesLoading,
                      vehiclesIsError,
                      vehicleOptions,
                      'Please wait...',
                      'Unable to load options',
                      'No vehicles found'
                    )}
                    value={
                      expense.vehicle 
                        ? (vehicleOptions.find((option: any) => option.key === expense.vehicle) as any)?.value ?? ''
                        : ''
                    }
                    changeHandler={value => {
                      if (isPlaceholderValue(value.vehicle?.toString() || '', 'vehicles')) return
                      
                      const selectedOption = vehicleOptions.find((option: any) => option.value === value.vehicle) as any
                      updateVehicleDetails({ vehicle: selectedOption?.key ?? '' })
                    }}
                    required
                    errorMessage={errorMap['vehicle']}
                    invalid={errorMap['vehicle']}
                    disabled={!expense.vehicleCategory || vehiclesLoading || vehiclesIsError}
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
                      updateStaffDetails({
                        staffCategory: value.staffCategory?.toString() ?? '',
                        staff: '' // Reset staff when category changes
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
                    options={getSelectOptions(
                      staffLoading,
                      staffIsError,
                      staffOptions,
                      'Please wait...',
                      'Unable to load options',
                      'No staff found'
                    )}
                    value={
                      expense.staff && staffOptions.length > 0
                        ? (staffOptions.find((option: any) => option.key === expense.staff) as any)?.value ?? ''
                        : expense.staff ?? ''
                    }
                    changeHandler={value => {
                      if (isPlaceholderValue(value.staff?.toString() || '', 'staff')) return
                      
                      const selectedOption = staffOptions.find((option: any) => option.value === value.staff) as any
                      updateStaffDetails({ staff: selectedOption?.key ?? '' })
                    }}
                    required
                    errorMessage={errorMap['staff']}
                    invalid={errorMap['staff']}
                    disabled={!expense.staffCategory || staffLoading || staffIsError}
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
                setExpense({
                  ...expense,
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

export default CreateExpense
