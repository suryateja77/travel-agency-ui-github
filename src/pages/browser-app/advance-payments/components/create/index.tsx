import React, { FunctionComponent, useState, useEffect } from 'react'
import { Breadcrumb, Text, Panel, Row, Column, TextInput, Button, SelectInput, TextArea, ConfirmationPopup, Modal, Alert } from '@base'
import { AdvancePaymentModel } from '@types'
import { bemClass, nameToPath, validatePayload } from '@utils'

import './style.scss'
import { useNavigate } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateAdvancePaymentMutation } from '@api/queries/advanced-payment'
import { useStaffByCategory } from '@api/queries/staff'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

const blk = 'create-advance-payment'

interface Props {}

const CreateAdvancePayment: FunctionComponent<Props> = () => {
  const sampleAdvancePaymentModel: AdvancePaymentModel = {
    staffCategory: '',
    staff: '',
    paymentDate: null,
    paymentMethod: '',
    amount: '', // Initialize as empty string like noOfSeats
    comment: '',
  }

  const navigate = useNavigate()
  const createAdvancePayment = useCreateAdvancePaymentMutation()

  const [advancePayment, setAdvancePayment] = useState<AdvancePaymentModel>(sampleAdvancePaymentModel)

  // Staff category path for API queries
  const staffCategoryPath = nameToPath(advancePayment.staffCategory)

  // Fetch staff by category when staff category is selected
  const {
    data: staffMembers,
    error: staffError,
    isLoading: staffLoading,
    isError: staffIsError
  } = useStaffByCategory(staffCategoryPath)

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New advance payment created successfully!')

  const [staffOptions, setStaffOptions] = useState<{ key: any; value: any }[]>([])

  // API Error states
  const [apiErrors, setApiErrors] = useState({
    staff: ''
  })

  const [errorMap, setErrorMap] = useState<Record<string, any>>(sampleAdvancePaymentModel)
  const [isValidationError, setIsValidationError] = useState(false)

  // Generic function to handle API responses and errors
  const handleApiResponse = (
    data: any,
    error: any,
    isError: boolean,
    errorKey: 'staff',
    setOptions: React.Dispatch<React.SetStateAction<{ key: any; value: any }[]>>,
    mapFunction: (item: any) => { key: any; value: any }
  ) => {
    if (isError) {
      const userFriendlyMessages = {
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
  const isPlaceholderValue = (value: string, type: 'staff') => {
    const placeholders = {
      staff: ['Please wait...', 'Unable to load options', 'No staff found']
    }
    return placeholders[type].includes(value)
  }

  // Unified function to update staff details
  const updateStaffDetails = (updates: Partial<Pick<AdvancePaymentModel, 'staffCategory' | 'staff'>>) => {
    setAdvancePayment(prev => ({
      ...prev,
      ...updates
    }))
  }

  useEffect(() => {
    handleApiResponse(
      staffMembers,
      staffError,
      staffIsError,
      'staff',
      setStaffOptions,
      (staffMember: { _id: any; name: any }) => ({ key: staffMember._id, value: staffMember.name })
    )
  }, [staffMembers, staffError, staffIsError])

  const navigateBack = () => {
    navigate('/advance-payments')
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

    const validationSchema = createValidationSchema(advancePayment)
    const { isValid, errorMap } = validatePayload(validationSchema, advancePayment)

    setIsValidationError(!isValid)
    setErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        await createAdvancePayment.mutateAsync({ ...advancePayment, staffCategory: nameToPath(advancePayment.staffCategory) })
        setConfirmationPopUpType('create')
        setConfirmationPopUpTitle('Success')
        setConfirmationPopUpSubtitle('New Advance Payment created successfully!')

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to create advance payment', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Error')
        setConfirmationPopUpSubtitle('Unable to create advance payment. Please try again.')
        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      }
    } else {
      console.log('Create Advance Payment: Validation Error', errorMap)
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
            New Advance Payment
          </Text>
          <Breadcrumb
          data={[
            {
              label: 'Home',
              route: '/dashboard',
            },
            {
              label: 'Advance Payments',
              route: '/advance-payments',
            },
            {
              label: 'New Advance Payment',
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
      {apiErrors.staff && (
        <Alert
          type="error"
          message={`Some data could not be loaded: ${apiErrors.staff}`}
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      <div className={bemClass([blk, 'content'])}>
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
                    advancePayment.staff && staffOptions.length > 0
                      ? (staffOptions.find((option: any) => option.key === advancePayment.staff) as any)?.value ?? ''
                      : advancePayment.staff ?? ''
                  }
                  changeHandler={value => {
                    if (isPlaceholderValue(value.staff?.toString() || '', 'staff')) return
                    
                    const selectedOption = staffOptions.find((option: any) => option.value === value.staff) as any
                    updateStaffDetails({ staff: selectedOption?.key ?? '' })
                  }}
                  required
                  errorMessage={errorMap['staff']}
                  invalid={errorMap['staff']}
                  disabled={!advancePayment.staffCategory || staffLoading || staffIsError}
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
                  value={advancePayment.paymentDate ? new Date(advancePayment.paymentDate).toISOString().slice(0, 10) : ''}
                  changeHandler={value => {
                    setAdvancePayment({
                      ...advancePayment,
                      paymentDate: value.paymentDate ? new Date(value.paymentDate) : null,
                    })
                  }}
                  required
                  errorMessage={errorMap['paymentDate']}
                  invalid={errorMap['paymentDate']}
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
                    setAdvancePayment({
                      ...advancePayment,
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
                <ConfiguredInput
                  label="Payment Method"
                  name="paymentMethod"
                  configToUse="Payment method"
                  type={CONFIGURED_INPUT_TYPES.SELECT}
                  value={advancePayment.paymentMethod}
                  changeHandler={value => {
                    setAdvancePayment({
                      ...advancePayment,
                      paymentMethod: value.paymentMethod?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['paymentMethod']}
                  invalid={errorMap['paymentMethod']}
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
                setAdvancePayment({
                  ...advancePayment,
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
            disabled={createAdvancePayment.isPending}
          >
            {createAdvancePayment.isPending ? 'Submitting...' : 'Submit'}
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

export default CreateAdvancePayment
