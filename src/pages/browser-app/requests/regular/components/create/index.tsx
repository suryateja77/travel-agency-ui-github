import { Breadcrumb, Text, Panel, Row, Column, TextInput, SelectInput, RadioGroup } from '@base'
import { RegularRequestModel } from '@types'
import { bemClass } from '@utils'
import React, { FunctionComponent, useState } from 'react'

import './style.scss'

const blk = 'create-regular-request'

interface CreateRegularRequestProps {}

const CreateRegularRequest: FunctionComponent<CreateRegularRequestProps> = () => {
  const [regularRequest, setRegularRequest] = useState<RegularRequestModel>({
    requestDetails: {
      customerSelection: 'Existing',
      vehicleSelection: 'Existing',
      staffSelection: 'Existing',
      requestType: '',
      pickupLocation: '',
      dropLocation: '',
      pickupDateAndTime: new Date(),
      dropDateAndTime: new Date(),
      openingKm: 0,
      closingKm: 0,
      totalTime: 0,
      totalDistance: 0,
    },
    customerDetails: {
      customerId: '',
      customerCategory: '',
    },
    vehicleDetails: {
      vehicleId: '',
      vehicleCategory: '',
    },
    staffDetails: {
      staffId: '',
      staffCategory: '',
    },
    otherCharges: {
      tollCharges: {
        charge: 0,
        chargeableToCustomer: false,
      },
      parking: {
        charge: 0,
        chargeableToCustomer: false,
      },
      nightHalt: {
        charge: 0,
        chargeableToCustomer: false,
        includeInDriverSalary: false,
      },
      driverAllowance: {
        charge: 0,
        chargeableToCustomer: false,
        includeInDriverSalary: false,
      },
    },
    advancePayment: {
      advanceFromCustomer: 0,
      advanceToDriver: 0,
    },
    paymentDetails: {
      paymentDate: new Date(),
      paymentMode: '',
      status: '',
    },
    comments: '',
  })
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          New Regular Request
        </Text>
        <Breadcrumb
          data={[
            {
              label: 'Home',
              route: '/dashboard',
            },
            {
              label: 'Regular Requests',
              route: '/requests/regular',
            },
            {
              label: 'New Regular Request',
            },
          ]}
        />
      </div>
      <div className={bemClass([blk, 'content'])}>
        <>
          <Panel
            title="Agent Information"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Customer Selection"
                  name="customerSelection"
                  options={['Existing Customer', 'New Customer']}
                  value={regularRequest.requestDetails.customerSelection}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        customerSelection: value.customerSelection,
                      },
                    })
                  }}
                  direction='horizontal'
                />
              </Column>
            </Row>
          </Panel>
        </>
      </div>
    </div>
  )
}

export default CreateRegularRequest
