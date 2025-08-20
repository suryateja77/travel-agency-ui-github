import { FunctionComponent, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Panel, Row, Column, TextInput, Toggle, Button, TextArea, DatePicker } from '@base'
import PageHeader from '@components/page-header'
import { StaffModel } from '@types'
import { bemClass, pathToName } from '@utils'

import './style.scss'

const blk = 'create-staff'

interface CreateStaffProps {
  category?: string
}

const initialStaffModel: StaffModel = {
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

const CreateStaff: FunctionComponent<CreateStaffProps> = ({ category = '' }) => {
  const params = useParams()
  const { id, action } = params
  const isEdit = action === 'edit'

  const [staff, setStaff] = useState<StaffModel>({
    ...initialStaffModel,
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
            route: `/staff/${category}`,
          },
          {
            label: isEdit ? 'update' : 'create',
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
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateStaff
