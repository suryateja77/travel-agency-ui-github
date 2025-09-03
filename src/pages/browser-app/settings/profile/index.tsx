import { useUserProfileQuery, useUpdateUserProfileMutation } from '@api/queries/user-profile'
import { Column, Panel, Row, TextInput, Button, Alert, Modal, ConfirmationPopup, Toggle, ReadOnlyText } from '@base'
import { PageHeader } from '@components'
import Loader from '@components/loader'
import { UserProfile } from '@types'
import { bemClass, validatePayload } from '@utils'
import React, { FunctionComponent, useMemo, useCallback, useReducer, useEffect } from 'react'
import { createValidationSchema } from './validation'

import './style.scss'

interface ProfileProps {}

const blk = 'profile'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

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
  userProfile: UserProfile
  validationErrors: ValidationErrors
  isValidationError: boolean
  showConfirmationModal: boolean
  confirmationModal: ConfirmationModal
}

// Action types for useReducer
type FormAction =
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof UserProfile; value: any } }
  | { type: 'UPDATE_ADDRESS_FIELD'; payload: { field: keyof UserProfile['address']; value: any } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }
  | { type: 'SET_CONFIRMATION_MODAL'; payload: Partial<ConfirmationModal> & { show: boolean } }

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_USER_PROFILE: UserProfile = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  isActive: true,
  agencyName: '',
  agencyRegistrationNo: '',
  address: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
  },
  primaryContact: '',
  secondaryContact: '',
  websiteLink: '',
  linkedInLink: '',
  facebookLink: '',
  instagramLink: '',
} as const

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================

const initialState: FormState = {
  userProfile: INITIAL_USER_PROFILE,
  validationErrors: {},
  isValidationError: false,
  showConfirmationModal: false,
  confirmationModal: {
    show: false,
    type: 'update',
    title: '',
    subtitle: '',
  },
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload }

    case 'UPDATE_FIELD':
      return {
        ...state,
        userProfile: { ...state.userProfile, [action.payload.field]: action.payload.value },
      }

    case 'UPDATE_ADDRESS_FIELD':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          address: { ...state.userProfile.address, [action.payload.field]: action.payload.value },
        },
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

const transformUserProfileResponse = (response: any) : UserProfile => {
  const {data} = response;
  return {
  id: data.id || data._id || '',
  firstName: data.firstName || '',
  lastName: data.lastName || '',
  email: data.email || '',
  isActive: data.isActive !== undefined ? data.isActive : true,
  agencyName: data.agencyName || '',
  agencyRegistrationNo: data.agencyRegistrationNo || '',
  address: {
    addressLine1: data.address?.addressLine1 || '',
    addressLine2: data.address?.addressLine2 || '',
    city: data.address?.city || '',
    state: data.address?.state || '',
    pinCode: data.address?.pinCode || '',
  },
  primaryContact: data.primaryContact || '',
  secondaryContact: data.secondaryContact || '',
  websiteLink: data.websiteLink || '',
  linkedInLink: data.linkedInLink || '',
  facebookLink: data.facebookLink || '',
  instagramLink: data.instagramLink || '',
}
}

const Profile: FunctionComponent<ProfileProps> = () => {
  const [state, dispatch] = useReducer(formReducer, initialState)
  const { userProfile, validationErrors, isValidationError, showConfirmationModal, confirmationModal } = state

  // API Hooks
  const { data: userProfileResponse, isLoading, error: getUserProfileError } = useUserProfileQuery()
  const updateUserProfile = useUpdateUserProfileMutation()

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFieldChange = useCallback(<K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } })
  }, [])

  const handleAddressFieldChange = useCallback(<K extends keyof UserProfile['address']>(field: K, value: UserProfile['address'][K]) => {
    dispatch({ type: 'UPDATE_ADDRESS_FIELD', payload: { field, value } })
  }, [])

  const closeConfirmationModal = useCallback(() => {
    dispatch({ type: 'SET_CONFIRMATION_MODAL', payload: { show: false } })
  }, [])

  const handleSubmit = useCallback(async () => {
    // Validate form
    const validationSchema = createValidationSchema(userProfile)
    const { isValid, errorMap } = validatePayload(validationSchema, userProfile)

    dispatch({
      type: 'SET_VALIDATION_ERRORS',
      payload: { errors: errorMap, hasError: !isValid },
    })

    if (!isValid) {
      console.error('Validation Error', errorMap)
      return
    }

    try {
      await updateUserProfile.mutateAsync({ ...userProfile })
      dispatch({
        type: 'SET_CONFIRMATION_MODAL',
        payload: {
          show: true,
          type: 'update',
          title: 'Success',
          subtitle: 'Profile updated successfully!',
        },
      })
    } catch (error) {
      console.error('Unable to update profile', error)
      dispatch({
        type: 'SET_CONFIRMATION_MODAL',
        payload: {
          show: true,
          type: 'delete',
          title: 'Error',
          subtitle: 'Unable to update profile. Please try again.',
        },
      })
    }
  }, [userProfile, updateUserProfile])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load user profile data
  useEffect(() => {
    if (userProfileResponse) {
      const transformedProfile = transformUserProfileResponse(userProfileResponse)
      dispatch({ type: 'SET_USER_PROFILE', payload: transformedProfile })
    }
  }, [userProfileResponse])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const breadcrumbData = useMemo(() => [{ label: 'Home', route: '/dashboard' }, { label: 'Profile' }], [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className={bemClass([blk])}>
        <PageHeader
          title={'Profile'}
          withBreadCrumb
          breadCrumbData={breadcrumbData}
        />

        {isValidationError && (
          <Alert
            type="error"
            message="There is an error with submission, please correct errors indicated below."
            className={bemClass([blk, 'margin-bottom'])}
          />
        )}

        {getUserProfileError && (
          <Alert
            type="error"
            message="Unable to load profile data. Please try again."
            className={bemClass([blk, 'margin-bottom'])}
          />
        )}

        <div className={bemClass([blk, 'content'])}>
          {isLoading ? (
            <Loader type="form" />
          ) : (
            <Row>
              <Column col={3}>
                <>
                  <div className={bemClass([blk, 'company-logo'])}>Company Logo</div>
                  <div className={bemClass([blk, 'company-details'])}>{userProfile.agencyName || 'Agency Name'}</div>
                  <div className={bemClass([blk, 'company-details'])}>{userProfile.websiteLink || 'www.example.com'}</div>
                  <div className={bemClass([blk, 'company-details', { last: true }])}>{userProfile.primaryContact || '+91 9876543210'}</div>
                </>
              </Column>
              <Column col={9}>
                {getUserProfileError ? (
                  <>
                    <Alert
                      type="error"
                      message="Unable to load profile data. Please try again."
                      className={bemClass([blk, 'margin-bottom'])}
                    />
                  </>
                ) : (
                  <>
                    <Panel
                      title="Basic Information"
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <Row>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="First Name"
                            name="firstName"
                            value={userProfile.firstName}
                            changeHandler={value => {
                              handleFieldChange('firstName', value.firstName?.toString() ?? '')
                            }}
                            required
                            errorMessage={validationErrors['firstName']}
                            invalid={!!validationErrors['firstName']}
                          />
                        </Column>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="Last Name"
                            name="lastName"
                            value={userProfile.lastName}
                            changeHandler={value => {
                              handleFieldChange('lastName', value.lastName?.toString() ?? '')
                            }}
                            required
                            errorMessage={validationErrors['lastName']}
                            invalid={!!validationErrors['lastName']}
                          />
                        </Column>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <ReadOnlyText
                            label="Email"
                            value={userProfile.email}
                            required
                          />
                        </Column>
                      </Row>
                      <Row>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="Address Line 1"
                            name="addressLine1"
                            value={userProfile.address.addressLine1}
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
                            value={userProfile.address.addressLine2}
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
                            value={userProfile.address.city}
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
                            value={userProfile.address.state}
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
                            value={userProfile.address.pinCode}
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
                      title="Agency details"
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <Row>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="Agency Name"
                            name="agencyName"
                            value={userProfile.agencyName}
                            changeHandler={value => {
                              handleFieldChange('agencyName', value.agencyName?.toString() ?? '')
                            }}
                            required
                            errorMessage={validationErrors['agencyName']}
                            invalid={!!validationErrors['agencyName']}
                          />
                        </Column>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="Agency Registration No"
                            name="agencyRegistrationNo"
                            value={userProfile.agencyRegistrationNo}
                            changeHandler={value => {
                              handleFieldChange('agencyRegistrationNo', value.agencyRegistrationNo?.toString() ?? '')
                            }}
                            required
                            errorMessage={validationErrors['agencyRegistrationNo']}
                            invalid={!!validationErrors['agencyRegistrationNo']}
                          />
                        </Column>
                      </Row>
                      <Row>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="Primary Contact"
                            name="primaryContact"
                            value={userProfile.primaryContact}
                            changeHandler={value => {
                              handleFieldChange('primaryContact', value.primaryContact?.toString() ?? '')
                            }}
                            required
                            errorMessage={validationErrors['primaryContact']}
                            invalid={!!validationErrors['primaryContact']}
                          />
                        </Column>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="Secondary Contact"
                            name="secondaryContact"
                            value={userProfile.secondaryContact}
                            changeHandler={value => {
                              handleFieldChange('secondaryContact', value.secondaryContact?.toString() ?? '')
                            }}
                            required
                            errorMessage={validationErrors['secondaryContact']}
                            invalid={!!validationErrors['secondaryContact']}
                          />
                        </Column>
                      </Row>
                    </Panel>

                    <Panel
                      title="Media Links"
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <Row>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="Website Link"
                            name="websiteLink"
                            type="url"
                            value={userProfile.websiteLink}
                            changeHandler={value => {
                              handleFieldChange('websiteLink', value.websiteLink?.toString() ?? '')
                            }}
                          />
                        </Column>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="LinkedIn Link"
                            name="linkedInLink"
                            type="url"
                            value={userProfile.linkedInLink}
                            changeHandler={value => {
                              handleFieldChange('linkedInLink', value.linkedInLink?.toString() ?? '')
                            }}
                          />
                        </Column>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="Facebook Link"
                            name="facebookLink"
                            type="url"
                            value={userProfile.facebookLink}
                            changeHandler={value => {
                              handleFieldChange('facebookLink', value.facebookLink?.toString() ?? '')
                            }}
                          />
                        </Column>
                      </Row>
                      <Row>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <TextInput
                            label="Instagram Link"
                            name="instagramLink"
                            type="url"
                            value={userProfile.instagramLink}
                            changeHandler={value => {
                              handleFieldChange('instagramLink', value.instagramLink?.toString() ?? '')
                            }}
                          />
                        </Column>
                      </Row>
                    </Panel>

                    <Panel
                      title="Status"
                      className={bemClass([blk, 'margin-bottom'])}
                    >
                      <Row>
                        <Column
                          col={4}
                          className={bemClass([blk, 'margin-bottom'])}
                        >
                          <Toggle
                            name="isActive"
                            label="Is Active"
                            checked={userProfile.isActive}
                            changeHandler={obj => {
                              handleFieldChange('isActive', !!obj.isActive)
                            }}
                          />
                        </Column>
                      </Row>
                    </Panel>

                    <div className={bemClass([blk, 'action-items'])}>
                      <Button
                        size="medium"
                        category="primary"
                        clickHandler={handleSubmit}
                      >
                        Update Profile
                      </Button>
                    </div>
                  </>
                )}
              </Column>
            </Row>
          )}
        </div>
      </div>

      <Modal
        show={showConfirmationModal}
        closeHandler={closeConfirmationModal}
      >
        <ConfirmationPopup
          type={confirmationModal.type}
          title={confirmationModal.title}
          subTitle={confirmationModal.subtitle}
          confirmButtonText="Okay"
          confirmHandler={closeConfirmationModal}
        />
      </Modal>
    </>
  )
}

export default Profile
