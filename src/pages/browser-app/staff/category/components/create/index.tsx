import { FunctionComponent, useReducer, useEffect, useMemo, useCallback } from 'react'
import { Panel, Row, Column, TextInput, Button, TextArea, ConfirmationPopup, Modal, Alert, Toggle, Text, Breadcrumb } from '@base'
import { INITIAL_STAFF, StaffModel } from '@types'
import { bemClass, pathToName, nameToPath, validatePayload } from '@utils'

import './style.scss'
import { useNavigate, useParams } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateStaffMutation, useUpdateStaffMutation, useStaffByIdQuery } from '@api/queries/staff'
import Loader from '@components/loader'

const blk = 'create-staff'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

interface StaffResponseModel extends StaffModel {
  _id: string
}

interface CreateStaffProps {
  category?: string
}

interface ValidationErrors {
  [key: string]: string
}

interface ConfirmationModal {
  show: boolean
  type: 'create' | 'update' | 'delete'
  title: string
  subtitle: string
}

// State interface for useReducer
interface FormState {
  staff: StaffModel
  isEditing: boolean
  staffId: string
  validationErrors: ValidationErrors
  isValidationError: boolean
  showConfirmationModal: boolean
  confirmationModal: ConfirmationModal
}

// Action types for useReducer
type FormAction =
  | { type: 'SET_STAFF'; payload: StaffModel }
  | { type: 'UPDATE_STAFF_FIELD'; payload: { field: keyof StaffModel; value: any } }
  | { type: 'UPDATE_ADDRESS_FIELD'; payload: { field: string; value: string } }
  | { type: 'SET_EDITING_MODE'; payload: { isEditing: boolean; staffId: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }
  | { type: 'SET_CONFIRMATION_MODAL'; payload: Partial<ConfirmationModal> & { show: boolean } }

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================

const initialState: FormState = {
  staff: INITIAL_STAFF,
  isEditing: false,
  staffId: '',
  validationErrors: {},
  isValidationError: false,
  showConfirmationModal: false,
  confirmationModal: {
    show: false,
    type: 'create',
    title: '',
    subtitle: '',
  },
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_STAFF':
      return { ...state, staff: action.payload }
    
    case 'UPDATE_STAFF_FIELD':
      return {
        ...state,
        staff: { ...state.staff, [action.payload.field]: action.payload.value },
      }
    
    case 'UPDATE_ADDRESS_FIELD':
      return {
        ...state,
        staff: {
          ...state.staff,
          address: { ...state.staff.address, [action.payload.field]: action.payload.value },
        },
      }
    
    case 'SET_EDITING_MODE':
      return {
        ...state,
        isEditing: action.payload.isEditing,
        staffId: action.payload.staffId,
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
    
    default:
      return state
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const transformStaffResponse = (response: StaffResponseModel): StaffModel => ({
  name: response.name || '',
  contact: response.contact || '',
  whatsAppNumber: response.whatsAppNumber || '',
  email: response.email || '',
  joiningDate: response.joiningDate ? new Date(response.joiningDate) : null,
  salary: response.salary || '',
  license: response.license || '',
  isActive: response.isActive !== undefined ? response.isActive : true,
  comment: response.comment || '',
  address: {
    addressLine1: response.address?.addressLine1 || '',
    addressLine2: response.address?.addressLine2 || '',
    city: response.address?.city || '',
    state: response.address?.state || '',
    pinCode: response.address?.pinCode || '',
  },
  category: response.category || '',
})

const CreateStaff: FunctionComponent<CreateStaffProps> = ({ category = '' }) => {
  const navigate = useNavigate()
  const params = useParams()
  
  const [state, dispatch] = useReducer(formReducer, initialState)
  const {
    staff,
    isEditing,
    staffId,
    validationErrors,
    isValidationError,
    showConfirmationModal,
    confirmationModal,
  } = state

  // API Hooks
  const createStaff = useCreateStaffMutation()
  const updateStaff = useUpdateStaffMutation()
  const { data: staffDataResponse, isLoading, error: getStaffDataError } = useStaffByIdQuery(params.id || '')

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleStaffFieldChange = useCallback(
    <K extends keyof StaffModel>(field: K, value: StaffModel[K]) => {
      dispatch({ type: 'UPDATE_STAFF_FIELD', payload: { field, value } })
    },
    []
  )

  const handleAddressFieldChange = useCallback((field: string, value: string) => {
    dispatch({ type: 'UPDATE_ADDRESS_FIELD', payload: { field, value } })
  }, [])

  const navigateBack = useCallback(() => {
    navigate(`/staff/${category}`)
  }, [navigate, category])

  const closeConfirmationModal = useCallback(() => {
    dispatch({ type: 'SET_CONFIRMATION_MODAL', payload: { show: false } })
  }, [])

  const handleSubmit = useCallback(async () => {
    // Validate form
    const validationSchema = createValidationSchema(staff)
    const { isValid, errorMap } = validatePayload(validationSchema, staff)

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
        await updateStaff.mutateAsync({ _id: staffId, ...staff })
        dispatch({
          type: 'SET_CONFIRMATION_MODAL',
          payload: {
            show: true,
            type: 'update',
            title: 'Success',
            subtitle: 'Staff updated successfully!',
          },
        })
      } else {
        await createStaff.mutateAsync({ ...staff, category: nameToPath(category) })
        dispatch({
          type: 'SET_CONFIRMATION_MODAL',
          payload: {
            show: true,
            type: 'create',
            title: 'Success',
            subtitle: 'New Staff created successfully!',
          },
        })
      }
    } catch (error) {
      console.error('Unable to create/update staff', error)
      dispatch({
        type: 'SET_CONFIRMATION_MODAL',
        payload: {
          show: true,
          type: 'delete',
          title: 'Error',
          subtitle: `Unable to ${isEditing ? 'update' : 'create'} staff. Please try again.`,
        },
      })
    }
  }, [staff, isEditing, staffId, updateStaff, createStaff, category])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load staff data when editing
  useEffect(() => {
    if (staffDataResponse) {
      const transformedStaff = transformStaffResponse(staffDataResponse)
      dispatch({ type: 'SET_STAFF', payload: transformedStaff })
      dispatch({
        type: 'SET_EDITING_MODE',
        payload: { isEditing: true, staffId: params.id || '' },
      })
    }
  }, [staffDataResponse, params.id])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const categoryDisplayName = useMemo(() => pathToName(category), [category])

  const breadcrumbData = useMemo(
    () => [
      { label: 'Home', route: '/dashboard' },
      { label: `${categoryDisplayName} Staff`, route: `/staff/${category}` },
      { label: `${isEditing ? 'Edit' : 'New'} ${categoryDisplayName} Staff` },
    ],
    [categoryDisplayName, category, isEditing]
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className={bemClass([blk])}>
        <div className={bemClass([blk, 'header'])}>
          <Text color="gray-darker" typography="l">
            {`${isEditing ? 'Edit' : 'New'} ${categoryDisplayName} Staff`}
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

        <div className={bemClass([blk, 'content'])}>
          {isLoading ? (
            <Loader type='form' />
          ) : (
            <>
              {getStaffDataError ? (
                <>
                  <Alert
                    type="error"
                    message="Unable to load staff data. Please try again."
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                  <Button size="medium" clickHandler={navigateBack}>
                    Go Back
                  </Button>
                </>
              ) : (
                <>
                  <Panel
                    title="Staff Details"
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <Row>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Staff Name"
                          name="name"
                          value={staff.name}
                          changeHandler={value => {
                            handleStaffFieldChange('name', value.name?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors.name}
                          invalid={!!validationErrors.name}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Contact"
                          name="contact"
                          value={staff.contact}
                          changeHandler={value => {
                            handleStaffFieldChange('contact', value.contact?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors.contact}
                          invalid={!!validationErrors.contact}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="WhatsApp Number"
                          name="whatsAppNumber"
                          value={staff.whatsAppNumber}
                          changeHandler={value => {
                            handleStaffFieldChange('whatsAppNumber', value.whatsAppNumber?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors.whatsAppNumber}
                          invalid={!!validationErrors.whatsAppNumber}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Email"
                          name="email"
                          value={staff.email || ''}
                          changeHandler={value => {
                            handleStaffFieldChange('email', value.email?.toString() ?? '')
                          }}
                          errorMessage={validationErrors.email}
                          invalid={!!validationErrors.email}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Salary"
                          name="salary"
                          type="number"
                          value={staff.salary ?? ''}
                          changeHandler={value => {
                            handleStaffFieldChange('salary', value.salary ? Number(value.salary) : '')
                          }}
                          required
                          errorMessage={validationErrors.salary}
                          invalid={!!validationErrors.salary}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Joining Date"
                          name="joiningDate"
                          type="date"
                          value={staff.joiningDate ? new Date(staff.joiningDate).toISOString().slice(0, 10) : ''}
                          changeHandler={value => {
                            handleStaffFieldChange('joiningDate', value.joiningDate ? new Date(value.joiningDate) : null)
                          }}
                          required
                          errorMessage={validationErrors.joiningDate}
                          invalid={!!validationErrors.joiningDate}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="License"
                          name="license"
                          value={staff.license || ''}
                          changeHandler={value => {
                            handleStaffFieldChange('license', value.license?.toString() ?? '')
                          }}
                          errorMessage={validationErrors.license}
                          invalid={!!validationErrors.license}
                        />
                      </Column>
                    </Row>
                  </Panel>

                  <Panel
                    title="Address Details"
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <Row>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Address Line 1"
                          name="addressLine1"
                          value={staff.address.addressLine1}
                          changeHandler={value => {
                            handleAddressFieldChange('addressLine1', value.addressLine1?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors['address.addressLine1']}
                          invalid={!!validationErrors['address.addressLine1']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Address Line 2"
                          name="addressLine2"
                          value={staff.address.addressLine2}
                          changeHandler={value => {
                            handleAddressFieldChange('addressLine2', value.addressLine2?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors['address.addressLine2']}
                          invalid={!!validationErrors['address.addressLine2']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="City"
                          name="city"
                          value={staff.address.city}
                          changeHandler={value => {
                            handleAddressFieldChange('city', value.city?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors['address.city']}
                          invalid={!!validationErrors['address.city']}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="State"
                          name="state"
                          value={staff.address.state}
                          changeHandler={value => {
                            handleAddressFieldChange('state', value.state?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors['address.state']}
                          invalid={!!validationErrors['address.state']}
                        />
                      </Column>
                      <Column
                        col={4}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Pin Code"
                          name="pinCode"
                          value={staff.address.pinCode}
                          changeHandler={value => {
                            handleAddressFieldChange('pinCode', value.pinCode?.toString() ?? '')
                          }}
                          required
                          errorMessage={validationErrors['address.pinCode']}
                          invalid={!!validationErrors['address.pinCode']}
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
                      value={staff.comment || ''}
                      changeHandler={value => {
                        handleStaffFieldChange('comment', value.comment?.toString() ?? '')
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
                          checked={staff.isActive}
                          changeHandler={obj => {
                            handleStaffFieldChange('isActive', !!obj.isActive)
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

export default CreateStaff
