import { FunctionComponent, useState } from 'react'
import { Panel, Row, Column, TextInput, Button, TextArea, DatePicker, ConfirmationPopup, Modal, Alert, Toggle, Breadcrumb } from '@base'
import { PageHeader } from '@components'
import { StaffModel } from '@types'
import { bemClass, pathToName, validatePayload } from '@utils'

import './style.scss'
import { useNavigate } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateStaffMutation } from '@api/queries/staff'

const blk = 'create-staff'

interface CreateStaffProps {
  category?: string
}

const CreateStaff: FunctionComponent<CreateStaffProps> = ({ category = '' }) => {
  const sampleStaffModel: StaffModel = {
    name: '',
    contact: '',
    whatsAppNumber: '',
    email: '',
    joiningDate: null,
    salary: '',
    license: '',
    isActive: true,
    comment: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pinCode: '',
    },
    category: '',
  }
  const navigate = useNavigate()
  const createStaff = useCreateStaffMutation()

  const [staff, setStaff] = useState<StaffModel>(sampleStaffModel)
  const [isEditing, setIsEditing] = useState(false)
  const [staffId, setStaffId] = useState('')

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New user role created successfully!')

  const [errorMap, setErrorMap] = useState<Record<string, any>>(sampleStaffModel)
  const [isValidationError, setIsValidationError] = useState(false)

  const navigateBack = () => {
    // Route to the StaffList page
    navigate(`/staff/${category}`)
  }

  const closeConfirmationPopUp = () => {
    if (showConfirmationModal) {
      setShowConfirmationModal(false)
    }
  }

  const submitHandler = async () => {
    const validationSchema = createValidationSchema(staff)
    const { isValid, errorMap } = validatePayload(validationSchema, staff)

    setIsValidationError(!isValid)
    setErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        if (isEditing) {
          // await updateStaff.mutateAsync({ _id: staffId, ...staff })
          setConfirmationPopUpType('update')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('Staff updated successfully!')
        } else {
          await createStaff.mutateAsync({ ...staff, category })
          setConfirmationPopUpType('create')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('New Staff created successfully!')
        }

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to create/Update staff', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Failed')
        setConfirmationPopUpSubtitle(`Unable to ${isEditing ? 'update' : 'create'} staff, please try again.`)
      }
    } else {
      console.log('Create Staff: Validation Error', errorMap)
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={isEditing ? `Update ${category}` : `Add ${category}`}
        withBreadCrumb
        breadCrumbData={[
          {
            label: 'Home',
            route: '/dashboard',
          },
          {
            label: `${category} list`,
            route: `/staff/${category}`,
          },
          {
            label: isEditing ? 'Update' : 'Create',
          },
        ]}
      />
      <div className={bemClass([blk, 'content'])}>
        <Panel
          title="Staff details"
          className={bemClass([blk, 'margin-bottom'])}
        >
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Staff name"
                name="name"
                value={staff.name}
                required
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    name: value.name?.toString() ?? '',
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Contact"
                name="contact"
                value={staff.contact}
                required
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    contact: value.contact?.toString() ?? '',
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Whats app number"
                name="whatsAppNumber"
                value={staff.whatsAppNumber}
                required
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    whatsAppNumber: value.whatsAppNumber?.toString() ?? '',
                  })
                }}
              />
            </Column>
          </Row>
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Email address"
                name="email"
                value={staff.email || ''}
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    email: value.email?.toString() ?? '',
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Salary"
                name="salary"
                value={staff.salary?.toString() || ''}
                required
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    salary: value.salary ? Number(value.salary) : 0,
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <DatePicker
                label="Joining date"
                name="joiningDate"
                value={staff.joiningDate}
                required
                showTimeSelect={false}
                dateFormat="dd-MMM-yyyy"
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    joiningDate: value.joiningDate as Date | null,
                  })
                }}
              />
            </Column>
          </Row>
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Licence"
                name="license"
                value={staff.license || ''}
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    license: value.license?.toString() ?? '',
                  })
                }}
              />
            </Column>
            <Column
              col={8}
              className={bemClass([blk, 'comment-column'])}
            >
              <TextArea
                label="Comments"
                name="comment"
                value={staff.comment || ''}
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    comment: value.comment?.toString() ?? '',
                  })
                }}
              />
            </Column>
          </Row>
        </Panel>

        <Panel
          title="Address details"
          className={bemClass([blk, 'margin-bottom'])}
        >
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Address line 1"
                name="addressLine1"
                value={staff.address.addressLine1}
                required
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    address: {
                      ...staff.address,
                      addressLine1: value.addressLine1?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Address line 2"
                name="addressLine2"
                value={staff.address.addressLine2}
                required
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    address: {
                      ...staff.address,
                      addressLine2: value.addressLine2?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="City"
                name="city"
                value={staff.address.city}
                required
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    address: {
                      ...staff.address,
                      city: value.city?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
          </Row>
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="State"
                name="state"
                value={staff.address.state}
                required
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    address: {
                      ...staff.address,
                      state: value.state?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Pin code"
                name="pinCode"
                value={staff.address.pinCode}
                required
                changeHandler={value => {
                  setStaff({
                    ...staff,
                    address: {
                      ...staff.address,
                      pinCode: value.pinCode?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
          </Row>
        </Panel>

        <Panel
          title="Is active"
          className={bemClass([blk, 'margin-bottom'])}
        >
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <Toggle
                name="isActive"
                label="Active"
                checked={staff.isActive}
                changeHandler={obj => {
                  setStaff({
                    ...staff,
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
            {`New ${pathToName(category)} Staff`}
          </Button>
          <Breadcrumb
            data={[
              {
                label: 'Home',
                route: '/dashboard',
              },
              {
                label: `${pathToName(category)} Staff`,
                route: `/staff/${category}`,
              },
              {
                label: `New ${pathToName(category)} Staff`,
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
                <TextInput
                  label="Staff Name"
                  name="name"
                  value={staff.name}
                  changeHandler={value => {
                    setStaff({
                      ...staff,
                      name: value.name?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['name']}
                  invalid={errorMap['name']}
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
                    setStaff({
                      ...staff,
                      contact: value.contact?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['contact']}
                  invalid={errorMap['contact']}
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
                    setStaff({
                      ...staff,
                      whatsAppNumber: value.whatsAppNumber?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['whatsAppNumber']}
                  invalid={errorMap['whatsAppNumber']}
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
                    setStaff({
                      ...staff,
                      email: value.email?.toString() ?? '',
                    })
                  }}
                  errorMessage={errorMap['email']}
                  invalid={errorMap['email']}
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
                    setStaff({
                      ...staff,
                      salary: value.salary ? Number(value.salary) : '',
                    })
                  }}
                  required
                  errorMessage={errorMap['salary']}
                  invalid={errorMap['salary']}
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
                    setStaff({
                      ...staff,
                      joiningDate: value.joiningDate ? new Date(value.joiningDate) : null,
                    })
                  }}
                  required
                  errorMessage={errorMap['joiningDate']}
                  invalid={errorMap['joiningDate']}
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
                    setStaff({
                      ...staff,
                      license: value.license?.toString() ?? '',
                    })
                  }}
                  errorMessage={errorMap['license']}
                  invalid={errorMap['license']}
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
                    setStaff({
                      ...staff,
                      address: {
                        ...staff.address,
                        addressLine1: value.addressLine1?.toString() ?? '',
                      },
                    })
                  }}
                  required
                  errorMessage={errorMap['address.addressLine1']}
                  invalid={errorMap['address.addressLine1']}
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
                    setStaff({
                      ...staff,
                      address: {
                        ...staff.address,
                        addressLine2: value.addressLine2?.toString() ?? '',
                      },
                    })
                  }}
                  required
                  errorMessage={errorMap['address.addressLine2']}
                  invalid={errorMap['address.addressLine2']}
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
                    setStaff({
                      ...staff,
                      address: {
                        ...staff.address,
                        city: value.city?.toString() ?? '',
                      },
                    })
                  }}
                  required
                  errorMessage={errorMap['address.city']}
                  invalid={errorMap['address.city']}
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
                    setStaff({
                      ...staff,
                      address: {
                        ...staff.address,
                        state: value.state?.toString() ?? '',
                      },
                    })
                  }}
                  required
                  errorMessage={errorMap['address.state']}
                  invalid={errorMap['address.state']}
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
                    setStaff({
                      ...staff,
                      address: {
                        ...staff.address,
                        pinCode: value.pinCode?.toString() ?? '',
                      },
                    })
                  }}
                  required
                  errorMessage={errorMap['address.pinCode']}
                  invalid={errorMap['address.pinCode']}
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
                setStaff({
                  ...staff,
                  comment: value.comment?.toString() ?? '',
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
                  checked={staff.isActive}
                  changeHandler={obj => {
                    setStaff({
                      ...staff,
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
    </div>
  )
}

export default CreateStaff
