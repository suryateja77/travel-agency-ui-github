import React, { FunctionComponent, useState } from 'react'
import { Breadcrumb, Text, Panel, Row, Column, TextInput, CheckBox, Button, SelectInput, TextArea } from '@base'
import { VehicleModel } from '@types'
import { bemClass } from '@utils'

import './style.scss'

const blk = 'create-vehicle'

interface CreateVehicleProps {}

const CreateVehicle: FunctionComponent<CreateVehicleProps> = () => {
  const [vehicle, setVehicle] = useState<VehicleModel>({
    vehicleDetails: {
      vehicleType: '',
      manufacturer: '',
      name: '',
      numberOfSeats: 0,
      registrationNumber: '',
      isACRequired: false,
      isMonthlyFixed: false,
    },
    monthlyFixedCustomerDetails: undefined,
    monthlyFixedPackageDetails: undefined,
    monthlyFixedStaffDetails: undefined,
    monthlyFixedContractDetails: undefined,
    comments: '',
  })

  const navigateBack = () => {
    // Route to the VehicleList page
    window.history.back()
  }

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          New Vehicle
        </Text>
        <Breadcrumb
          data={[
            {
              label: 'Home',
              route: '/dashboard',
            },
            {
              label: 'Vehicles',
              route: '/vehicles/own',
            },
            {
              label: 'New Vehicle',
            },
          ]}
        />
      </div>
      <div className={bemClass([blk, 'content'])}>
        <Panel
          title="Vehicle Details"
          className={bemClass([blk, 'margin-bottom'])}
        >
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <SelectInput
                label="Vehicle Type"
                name="vehicleType"
                options={[
                  { key: 'Sedan', value: 'Sedan' },
                  { key: 'SUV', value: 'SUV' },
                  { key: 'Hatchback', value: 'Hatchback' },
                  { key: 'Bus', value: 'Bus' },
                ]}
                value={vehicle.vehicleDetails.vehicleType}
                changeHandler={value => {
                  setVehicle({
                    ...vehicle,
                    vehicleDetails: {
                      ...vehicle.vehicleDetails,
                      vehicleType: value.vehicleType?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Manufacturer"
                name="manufacturer"
                value={vehicle.vehicleDetails.manufacturer}
                changeHandler={value => {
                  setVehicle({
                    ...vehicle,
                    vehicleDetails: {
                      ...vehicle.vehicleDetails,
                      manufacturer: value.manufacturer?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Vehicle Name"
                name="name"
                value={vehicle.vehicleDetails.name}
                changeHandler={value => {
                  setVehicle({
                    ...vehicle,
                    vehicleDetails: {
                      ...vehicle.vehicleDetails,
                      name: value.name?.toString() ?? '',
                    },
                  })
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
                label="Number of Seats"
                name="numberOfSeats"
                type="number"
                value={vehicle.vehicleDetails.numberOfSeats ?? ''}
                changeHandler={value => {
                  setVehicle({
                    ...vehicle,
                    vehicleDetails: {
                      ...vehicle.vehicleDetails,
                      numberOfSeats: value.numberOfSeats ? Number(value.numberOfSeats) : 0,
                    },
                  })
                }}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Registration Number"
                name="registrationNumber"
                value={vehicle.vehicleDetails.registrationNumber}
                changeHandler={value => {
                  setVehicle({
                    ...vehicle,
                    vehicleDetails: {
                      ...vehicle.vehicleDetails,
                      registrationNumber: value.registrationNumber?.toString() ?? '',
                    },
                  })
                }}
              />
            </Column>
          </Row>
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <CheckBox
                id="isACRequired"
                label="AC Required"
                checked={vehicle.vehicleDetails.isACRequired}
                changeHandler={obj =>
                  setVehicle({
                    ...vehicle,
                    vehicleDetails: {
                      ...vehicle.vehicleDetails,
                      isACRequired: !!obj.isACRequired,
                    },
                  })
                }
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <CheckBox
                id="isMonthlyFixed"
                label="Monthly Fixed"
                checked={vehicle.vehicleDetails.isMonthlyFixed}
                changeHandler={obj =>
                  setVehicle({
                    ...vehicle,
                    vehicleDetails: {
                      ...vehicle.vehicleDetails,
                      isMonthlyFixed: !!obj.isMonthlyFixed,
                    },
                    // Reset monthly fixed details when toggling off
                    monthlyFixedCustomerDetails: obj.isMonthlyFixed ? vehicle.monthlyFixedCustomerDetails : undefined,
                    monthlyFixedPackageDetails: obj.isMonthlyFixed ? vehicle.monthlyFixedPackageDetails : undefined,
                    monthlyFixedStaffDetails: obj.isMonthlyFixed ? vehicle.monthlyFixedStaffDetails : undefined,
                    monthlyFixedContractDetails: obj.isMonthlyFixed ? vehicle.monthlyFixedContractDetails : undefined,
                  })
                }
              />
            </Column>
          </Row>
        </Panel>

        {vehicle.vehicleDetails.isMonthlyFixed && (
          <>
            <Panel
              title="Monthly Fixed Customer Details"
              className={bemClass([blk, 'margin-bottom'])}
            >
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Customer Category"
                    name="customerCategory"
                    options={[
                      { key: 'Regular', value: 'Regular' },
                      { key: 'Operator', value: 'Operator' },
                    ]}
                    value={vehicle.monthlyFixedCustomerDetails?.customerCategory ?? ''}
                    changeHandler={value => {
                      setVehicle({
                        ...vehicle,
                        monthlyFixedCustomerDetails: {
                          customerCategory: value.customerCategory?.toString() ?? '',
                          customerId: vehicle.monthlyFixedCustomerDetails?.customerId ?? '',
                        },
                      })
                    }}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Customer"
                    name="customerId"
                    options={[
                      { key: 'Ramesh', value: 'Ramesh' },
                      { key: 'Suresh', value: 'Suresh' },
                    ]}
                    value={vehicle.monthlyFixedCustomerDetails?.customerId ?? ''}
                    changeHandler={value => {
                      setVehicle({
                        ...vehicle,
                        monthlyFixedCustomerDetails: {
                          customerCategory: vehicle.monthlyFixedCustomerDetails?.customerCategory ?? '',
                          customerId: value.customerId?.toString() ?? '',
                        },
                      })
                    }}
                  />
                </Column>
              </Row>
            </Panel>

            <Panel
              title="Monthly Fixed Package Details"
              className={bemClass([blk, 'margin-bottom'])}
            >
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Package Category"
                    name="packageCategory"
                    options={[
                      { key: 'Package 1', value: 'Package 1' },
                      { key: 'Package 2', value: 'Package 2' },
                    ]}
                    value={vehicle.monthlyFixedPackageDetails?.packageCategory ?? ''}
                    changeHandler={value => {
                      setVehicle({
                        ...vehicle,
                        monthlyFixedPackageDetails: {
                          packageCategory: value.packageCategory?.toString() ?? '',
                          packageId: vehicle.monthlyFixedPackageDetails?.packageId ?? '',
                        },
                      })
                    }}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Package"
                    name="packageId"
                    options={[
                      { key: 'Package 1', value: 'Package 1' },
                      { key: 'Package 2', value: 'Package 2' },
                    ]}
                    value={vehicle.monthlyFixedPackageDetails?.packageId ?? ''}
                    changeHandler={value => {
                      setVehicle({
                        ...vehicle,
                        monthlyFixedPackageDetails: {
                          packageCategory: vehicle.monthlyFixedPackageDetails?.packageCategory ?? '',
                          packageId: value.packageId?.toString() ?? '',
                        },
                      })
                    }}
                  />
                </Column>
              </Row>
            </Panel>

            <Panel
              title="Monthly Fixed Staff Details"
              className={bemClass([blk, 'margin-bottom'])}
            >
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Staff Category"
                    name="staffCategory"
                    options={[
                      { key: 'Driver', value: 'Driver' },
                      { key: 'Guide', value: 'Guide' },
                    ]}
                    value={vehicle.monthlyFixedStaffDetails?.staffCategory ?? ''}
                    changeHandler={value => {
                      setVehicle({
                        ...vehicle,
                        monthlyFixedStaffDetails: {
                          staffCategory: value.staffCategory?.toString() ?? '',
                          staffId: vehicle.monthlyFixedStaffDetails?.staffId ?? '',
                        },
                      })
                    }}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Staff"
                    name="staffId"
                    options={[
                      { key: 'Driver1', value: 'Driver1' },
                      { key: 'Driver2', value: 'Driver2' },
                    ]}
                    value={vehicle.monthlyFixedStaffDetails?.staffId ?? ''}
                    changeHandler={value => {
                      setVehicle({
                        ...vehicle,
                        monthlyFixedStaffDetails: {
                          staffCategory: vehicle.monthlyFixedStaffDetails?.staffCategory ?? '',
                          staffId: value.staffId?.toString() ?? '',
                        },
                      })
                    }}
                  />
                </Column>
              </Row>
            </Panel>

            <Panel
              title="Monthly Fixed Contract Details"
              className={bemClass([blk, 'margin-bottom'])}
            >
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextInput
                    label="Contract Start Date"
                    name="contractStartDate"
                    type="date"
                    value={vehicle.monthlyFixedContractDetails?.contractStartDate ? new Date(vehicle.monthlyFixedContractDetails.contractStartDate).toISOString().slice(0, 10) : ''}
                    changeHandler={value => {
                      setVehicle({
                        ...vehicle,
                        monthlyFixedContractDetails: {
                          contractStartDate: value.contractStartDate ? new Date(value.contractStartDate) : null,
                          contractEndDate: vehicle.monthlyFixedContractDetails?.contractEndDate ?? null,
                        },
                      })
                    }}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextInput
                    label="Contract End Date"
                    name="contractEndDate"
                    type="date"
                    value={vehicle.monthlyFixedContractDetails?.contractEndDate ? new Date(vehicle.monthlyFixedContractDetails.contractEndDate).toISOString().slice(0, 10) : ''}
                    changeHandler={value => {
                      setVehicle({
                        ...vehicle,
                        monthlyFixedContractDetails: {
                          contractStartDate: vehicle.monthlyFixedContractDetails?.contractStartDate ?? null,
                          contractEndDate: value.contractEndDate ? new Date(value.contractEndDate) : null,
                        },
                      })
                    }}
                  />
                </Column>
              </Row>
            </Panel>
          </>
        )}

        <Panel
          title="Comments"
          className={bemClass([blk, 'margin-bottom'])}
        >
          <TextArea
            className={bemClass([blk, 'margin-bottom'])}
            name="comments"
            value={vehicle.comments}
            changeHandler={value => {
              setVehicle({
                ...vehicle,
                comments: value.comments?.toString() ?? '',
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
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateVehicle
