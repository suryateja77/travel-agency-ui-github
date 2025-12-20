import { useUserProfileQuery, useUpdateUserProfileMutation } from '@api/queries/user-profile'
import { Column, Panel, Row, TextInput, Button, Alert, ReadOnlyText } from '@base'
import { PageHeader } from '@components'
import Loader from '@components/loader'
import { UserProfile, sampleUserProfile } from '@types'
import { bemClass, validatePayload } from '@utils'
import React, { FunctionComponent, useMemo, useState, useEffect } from 'react'
import { createValidationSchema } from './validation'
import { useToast } from '@contexts/ToastContext'
import { useAuth } from '@contexts/AuthContext'

import './style.scss'

const blk = 'profile'

interface ProfileProps {}

const Profile: FunctionComponent<ProfileProps> = () => {
  const { showToast } = useToast()
  const { isAdmin } = useAuth()

  // API Hooks
  const { data: userProfileResponse, isLoading, error: getUserProfileError } = useUserProfileQuery()
  const updateUserProfile = useUpdateUserProfileMutation()

  // State
  const [userProfile, setUserProfile] = useState<UserProfile>(sampleUserProfile)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isValidationError, setIsValidationError] = useState(false)
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false)

  // Load user profile data
  useEffect(() => {
    if (userProfileResponse?.data) {
      setUserProfile(userProfileResponse.data)
    }
  }, [userProfileResponse])

  // Field-level validation to clear errors immediately
  const validateField = (fieldPath: string, updatedData: UserProfile) => {
    const validationSchema = createValidationSchema(updatedData)
    const { errorMap } = validatePayload(validationSchema, updatedData)

    setValidationErrors(prev => {
      const newErrors = { ...prev }
      if (!errorMap[fieldPath]) {
        delete newErrors[fieldPath]
      } else {
        newErrors[fieldPath] = errorMap[fieldPath]
      }
      return newErrors
    })

    // Clear validation error alert if no errors remain
    const hasErrors = Object.keys({ ...validationErrors, [fieldPath]: errorMap[fieldPath] })
      .filter(key => key !== fieldPath)
      .some(key => validationErrors[key])

    if (!hasErrors && !errorMap[fieldPath]) {
      setIsValidationError(false)
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      setSubmitButtonLoading(true)
      
      // Validate form
      const validationSchema = createValidationSchema(userProfile)
      const { isValid, errorMap } = validatePayload(validationSchema, userProfile)

      setValidationErrors(errorMap)
      setIsValidationError(!isValid)

      if (!isValid) {
        console.error('Validation Error', errorMap)
        setSubmitButtonLoading(false)
        return
      }

      await updateUserProfile.mutateAsync({ ...userProfile })
      showToast('Profile updated successfully!', 'success')
      setSubmitButtonLoading(false)
    } catch (error) {
      setSubmitButtonLoading(false)
      console.error('Unable to update profile', error)
      showToast('Unable to update profile. Please try again.', 'error')
    }
  }

  // Memoized values
  const breadcrumbData = useMemo(() => [{ label: 'Home', route: '/dashboard' }, { label: 'Settings' }, { label: 'Profile' }], [])

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Profile"
        withBreadCrumb
        breadCrumbData={breadcrumbData}
      />

      {isValidationError && (
        <Alert
          type="error"
          message="Please review and correct the errors indicated below before submitting."
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
          <div className={bemClass([blk, 'layout'])}>
            {/* Sidebar */}
            <div className={bemClass([blk, 'sidebar'])}>
              <div className={bemClass([blk, 'company-logo'])}>Company Logo</div>
              <div className={bemClass([blk, 'company-details'])}>{userProfile.agencyName || 'Agency Name'}</div>
              <div className={bemClass([blk, 'company-details'])}>{userProfile.agencyEmail || 'agency@example.com'}</div>
              <div className={bemClass([blk, 'company-details', { last: true }])}>{userProfile.agencyContactNumber || '+91 9876543210'}</div>
            </div>

            {/* Form Content */}
            <div className={bemClass([blk, 'form-content'])}>
              {getUserProfileError ? (
                <Alert
                  type="error"
                  message="Unable to load profile data. Please try again."
                  className={bemClass([blk, 'margin-bottom'])}
                />
              ) : (
                <>
                  {/* Client Details Panel */}
                  <Panel
                    title="Client Details"
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <Row>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', ['disabled']])}
                      >
                        <TextInput
                          label="Agency Name"
                          name="agencyName"
                          value={userProfile.agencyName}
                          changeHandler={() => {}}
                          disabled
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="Contact Number"
                          name="agencyContactNumber"
                          value={userProfile.agencyContactNumber}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              agencyContactNumber: value.agencyContactNumber?.toString() ?? '',
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('agencyContactNumber', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['agencyContactNumber']}
                          invalid={!!validationErrors['agencyContactNumber']}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="Email"
                          name="agencyEmail"
                          type="email"
                          value={userProfile.agencyEmail}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              agencyEmail: value.agencyEmail?.toString() ?? '',
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('agencyEmail', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['agencyEmail']}
                          invalid={!!validationErrors['agencyEmail']}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <ReadOnlyText
                          label="Subscription Status"
                          value={userProfile.subscriptionStatus.toUpperCase()}
                          color={userProfile.subscriptionStatus === 'active' ? 'success' : 'warning'}
                          size="large"
                        />
                      </Column>
                    </Row>
                  </Panel>

                  {/* Address Details Panel */}
                  <Panel
                    title="Address Details"
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <Row>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="Address Line 1"
                          name="addressLine1"
                          value={userProfile.address.addressLine1}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              address: {
                                ...userProfile.address,
                                addressLine1: value.addressLine1?.toString() ?? '',
                              },
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('address.addressLine1', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['address.addressLine1']}
                          invalid={!!validationErrors['address.addressLine1']}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="Address Line 2"
                          name="addressLine2"
                          value={userProfile.address.addressLine2}
                          changeHandler={value => {
                            setUserProfile({
                              ...userProfile,
                              address: {
                                ...userProfile.address,
                                addressLine2: value.addressLine2?.toString() ?? '',
                              },
                            })
                          }}
                          disabled={!isAdmin}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="City"
                          name="city"
                          value={userProfile.address.city}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              address: {
                                ...userProfile.address,
                                city: value.city?.toString() ?? '',
                              },
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('address.city', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['address.city']}
                          invalid={!!validationErrors['address.city']}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="State"
                          name="state"
                          value={userProfile.address.state}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              address: {
                                ...userProfile.address,
                                state: value.state?.toString() ?? '',
                              },
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('address.state', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['address.state']}
                          invalid={!!validationErrors['address.state']}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="Pin Code"
                          name="pinCode"
                          value={userProfile.address.pinCode}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              address: {
                                ...userProfile.address,
                                pinCode: value.pinCode?.toString() ?? '',
                              },
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('address.pinCode', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['address.pinCode']}
                          invalid={!!validationErrors['address.pinCode']}
                        />
                      </Column>
                    </Row>
                  </Panel>

                  {/* Point of Contact Panel */}
                  <Panel
                    title="Point of Contact"
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <Row>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="Name"
                          name="pocName"
                          value={userProfile.pointOfContact.name}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              pointOfContact: {
                                ...userProfile.pointOfContact,
                                name: value.pocName?.toString() ?? '',
                              },
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('pointOfContact.name', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['pointOfContact.name']}
                          invalid={!!validationErrors['pointOfContact.name']}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="Designation"
                          name="pocDesignation"
                          value={userProfile.pointOfContact.designation}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              pointOfContact: {
                                ...userProfile.pointOfContact,
                                designation: value.pocDesignation?.toString() ?? '',
                              },
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('pointOfContact.designation', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['pointOfContact.designation']}
                          invalid={!!validationErrors['pointOfContact.designation']}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="Contact Number"
                          name="pocContactNumber"
                          value={userProfile.pointOfContact.contactNumber}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              pointOfContact: {
                                ...userProfile.pointOfContact,
                                contactNumber: value.pocContactNumber?.toString() ?? '',
                              },
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('pointOfContact.contactNumber', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['pointOfContact.contactNumber']}
                          invalid={!!validationErrors['pointOfContact.contactNumber']}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom', !isAdmin ? ['disabled'] : undefined])}
                      >
                        <TextInput
                          label="Email"
                          name="pocEmail"
                          type="email"
                          value={userProfile.pointOfContact.email}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              pointOfContact: {
                                ...userProfile.pointOfContact,
                                email: value.pocEmail?.toString() ?? '',
                              },
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('pointOfContact.email', userProfile)}
                          disabled={!isAdmin}
                          required
                          errorMessage={validationErrors['pointOfContact.email']}
                          invalid={!!validationErrors['pointOfContact.email']}
                        />
                      </Column>
                    </Row>
                  </Panel>

                  {/* User Details Panel */}
                  <Panel
                    title="User Details"
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <Row>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Name"
                          name="name"
                          value={userProfile.name}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              name: value.name?.toString() ?? '',
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('name', userProfile)}
                          required
                          errorMessage={validationErrors['name']}
                          invalid={!!validationErrors['name']}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Contact Number"
                          name="contactNumber"
                          value={userProfile.contactNumber}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              contactNumber: value.contactNumber?.toString() ?? '',
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('contactNumber', userProfile)}
                          required
                          errorMessage={validationErrors['contactNumber']}
                          invalid={!!validationErrors['contactNumber']}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Email"
                          name="email"
                          type="email"
                          value={userProfile.email}
                          changeHandler={value => {
                            const updatedData = {
                              ...userProfile,
                              email: value.email?.toString() ?? '',
                            }
                            setUserProfile(updatedData)
                          }}
                          onBlur={() => validateField('email', userProfile)}
                          required
                          errorMessage={validationErrors['email']}
                          invalid={!!validationErrors['email']}
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <TextInput
                          label="Designation"
                          name="designation"
                          value={userProfile.designation}
                          changeHandler={value => {
                            setUserProfile({
                              ...userProfile,
                              designation: value.designation?.toString() ?? '',
                            })
                          }}
                        />
                      </Column>
                    </Row>
                    <Row>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <ReadOnlyText
                          label="Role"
                          value={userProfile.role?.roleName || 'N/A'}
                          color={isAdmin ? 'primary' : 'gray-darker'}
                          size="large"
                        />
                      </Column>
                      <Column
                        col={3}
                        className={bemClass([blk, 'margin-bottom'])}
                      >
                        <ReadOnlyText
                          label="User Group"
                          value={userProfile.userGroup?.groupName || 'None'}
                          color="gray-darker"
                          size="large"
                        />
                      </Column>
                    </Row>
                  </Panel>

                  {/* Action Buttons */}
                  <div className={bemClass([blk, 'action-items'])}>
                    <Button
                      size="medium"
                      category="primary"
                      clickHandler={handleSubmit}
                      loading={submitButtonLoading}
                    >
                      Update Profile
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
