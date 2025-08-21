import { FunctionComponent, useState } from 'react'
import { Panel, Row, Column, TextInput, Button, TextArea, ConfirmationPopup, Modal, Alert, Toggle, Breadcrumb } from '@base'
import { PageHeader } from '@components'
import { CustomerModel } from '@types'
import { bemClass, pathToName, validatePayload } from '@utils'

import './style.scss'
import { useNavigate } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateCustomerMutation } from '@api/queries/customer'

const blk = 'create-customer'

interface CreateCustomerProps {
  category?: string
}

const CreateCustomer: FunctionComponent<CreateCustomerProps> = ({ category = '' }) => {
  const sampleCustomerModel: CustomerModel = {
    name: '',
    contact: '',
    whatsAppNumber: '',
    email: '',
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
  const createCustomer = useCreateCustomerMutation()

  const [customer, setCustomer] = useState<CustomerModel>(sampleCustomerModel)
  const [isEditing, setIsEditing] = useState(false)
  const [customerId, setCustomerId] = useState('')

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New customer created successfully!')

  const [errorMap, setErrorMap] = useState<Record<string, any>>(sampleCustomerModel)
  const [isValidationError, setIsValidationError] = useState(false)

  const navigateBack = () => {
    // Route to the CustomersList page
    navigate(`/customers/${category}`)
  }

  const closeConfirmationPopUp = () => {
    if (showConfirmationModal) {
      setShowConfirmationModal(false)
    }
  }

  const submitHandler = async () => {
    const validationSchema = createValidationSchema(customer)
    const { isValid, errorMap } = validatePayload(validationSchema, customer)

    setIsValidationError(!isValid)
    setErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        if (isEditing) {
          // await updateCustomer.mutateAsync({ _id: customerId, ...customer })
          setConfirmationPopUpType('update')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('Customer updated successfully!')
        } else {
          await createCustomer.mutateAsync({ ...customer, category })
          setConfirmationPopUpType('create')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('New Customer created successfully!')
        }

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to create/Update customer', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Failed')
        setConfirmationPopUpSubtitle(`Unable to ${isEditing ? 'update' : 'create'} customer, please try again.`)
      }
    } else {
      console.log('Create Customer: Validation Error', errorMap)
    }
  }

  const categoryName = pathToName(category)

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={isEditing ? `Update ${categoryName}` : `Add ${categoryName}`}
        withBreadCrumb
        breadCrumbData={[
          {
            label: 'Home',
            route: '/dashboard',
          },
          {
            label: `${categoryName} list`,
            route: `/customers/${category}`,
          },
          {
            label: isEditing ? 'Update' : 'Create',
          },
        ]}
      />
      {isValidationError && (
        <Alert
          type="error"
          message="There is an error with submission, please correct errors indicated below."
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      <div className={bemClass([blk, 'content'])}>
        <Panel
          title="Customer details"
          className={bemClass([blk, 'margin-bottom'])}
        >
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Customer Name"
                name="name"
                value={customer.name}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
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
                value={customer.contact}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
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
                value={customer.whatsAppNumber}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
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
                value={customer.email || ''}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    email: value.email?.toString() ?? '',
                  })
                }}
                errorMessage={errorMap['email']}
                invalid={errorMap['email']}
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
                value={customer.address.addressLine1}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
                value={customer.address.addressLine2}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
                value={customer.address.city}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
                value={customer.address.state}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
                value={customer.address.pinCode}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
            value={customer.comment || ''}
            changeHandler={value => {
              setCustomer({
                ...customer,
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
                checked={customer.isActive}
                changeHandler={obj => {
                  setCustomer({
                    ...customer,
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

export default CreateCustomer