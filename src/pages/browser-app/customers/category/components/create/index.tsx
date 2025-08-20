import { FunctionComponent, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Panel, Row, Column, TextInput, Toggle, Button, TextArea } from '@base'
import PageHeader from '@components/page-header'
import { CustomerModel } from '@types'
import { bemClass, pathToName } from '@utils'

import './style.scss'

const blk = 'create-customer'

interface CreateCustomerProps {
  category?: string
}

const initialCustomerModel: CustomerModel = {
  name: '',
  contact: '',
  whatsAppNumber: '',
  email: '',
  address: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
  },
  isActive: true,
  comment: '',
  category: '',
}

const CreateCustomer: FunctionComponent<CreateCustomerProps> = ({ category = '' }) => {
  const params = useParams()
  const { id, action } = params
  const isEdit = action === 'edit'

  const [customer, setCustomer] = useState<CustomerModel>({
    ...initialCustomerModel,
    category: category,
  })

  const navigateBack = () => {
    window.history.back()
  }

  const categoryName = pathToName(category)

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={isEdit ? `Update ${categoryName}` : `Add ${categoryName}`}
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
            label: isEdit ? 'Update' : 'Create',
          },
        ]}
      />
      <div className={bemClass([blk, 'content'])}>
        <Panel
          title="Customer details"
          className={bemClass([blk, 'margin-bottom'])}
        >
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'field-column'])}
            >
              <TextInput
                label="Customer name"
                name="name"
                value={customer.name}
                required
                changeHandler={value => {
                  setCustomer({
                    ...customer,
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
                value={customer.contact}
                required
                changeHandler={value => {
                  setCustomer({
                    ...customer,
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
                value={customer.whatsAppNumber}
                required
                changeHandler={value => {
                  setCustomer({
                    ...customer,
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
                value={customer.email || ''}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    email: value.email?.toString() ?? '',
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
                value={customer.comment || ''}
                changeHandler={value => {
                  setCustomer({
                    ...customer,
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
                value={customer.address.addressLine1}
                required
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
                value={customer.address.addressLine2}
                required
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
                value={customer.address.city}
                required
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
                value={customer.address.state}
                required
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
                value={customer.address.pinCode}
                required
                changeHandler={value => {
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
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
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateCustomer