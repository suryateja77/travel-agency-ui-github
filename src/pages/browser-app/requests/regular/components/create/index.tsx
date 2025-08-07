import { Breadcrumb, Text, Panel, Row, Column, TextInput, SelectInput, RadioGroup, CheckBox, TextArea, Button } from '@base'
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
    customerPackageDetails: {
      packageCategory: '',
      packageId: '',
    },
    otherCharges: {
      toll: {
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

  const navigateBack = () => {
    // Logic to navigate back to the previous page
    window.history.back()
  }

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
            title="Request Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Customer Selection"
                  name="customerSelection"
                  options={['Existing', 'New']}
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
                  direction="horizontal"
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Vehicle Selection"
                  name="vehicleSelection"
                  options={['Existing', 'New']}
                  value={regularRequest.requestDetails.vehicleSelection}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        vehicleSelection: value.vehicleSelection,
                      },
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Staff Selection"
                  name="staffSelection"
                  options={['Existing', 'New']}
                  value={regularRequest.requestDetails.staffSelection}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        staffSelection: value.staffSelection,
                      },
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="Request Type"
                  name="requestType"
                  options={[
                    { key: 'Local', value: 'Local' },
                    { key: 'Out Station', value: 'Out Station' },
                  ]}
                  value={regularRequest.requestDetails.requestType}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        requestType: value.requestType?.toString() ?? '',
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
                  label="Pickup Location"
                  name="pickupLocation"
                  value={regularRequest.requestDetails.pickupLocation}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        pickupLocation: value.pickupLocation?.toString() ?? '',
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
                  label="Drop Location"
                  name="dropLocation"
                  value={regularRequest.requestDetails.dropLocation}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        dropLocation: value.dropLocation?.toString() ?? '',
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
                  label="Pickup Date and Time"
                  name="pickupDateAndTime"
                  type="datetime-local"
                  value={regularRequest.requestDetails.pickupDateAndTime ? new Date(regularRequest.requestDetails.pickupDateAndTime).toISOString().slice(0, 16) : ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        pickupDateAndTime: value.pickupDateAndTime ? new Date(value.pickupDateAndTime) : null,
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
                  label="Dropoff Date and Time"
                  name="dropDateAndTime"
                  type="datetime-local"
                  value={regularRequest.requestDetails.dropDateAndTime ? new Date(regularRequest.requestDetails.dropDateAndTime).toISOString().slice(0, 16) : ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        dropDateAndTime: value.dropDateAndTime ? new Date(value.dropDateAndTime) : null,
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
                  label="Opening Km"
                  name="openingKm"
                  type="number"
                  value={regularRequest.requestDetails.openingKm ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        openingKm: value.openingKm ? Number(value.openingKm) : null,
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
                  label="Closing Km"
                  name="closingKm"
                  type="number"
                  value={regularRequest.requestDetails.closingKm ?? ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      requestDetails: {
                        ...regularRequest.requestDetails,
                        closingKm: value.closingKm ? Number(value.closingKm) : null,
                      },
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>
          <Panel
            title="Customer Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            {regularRequest.requestDetails.customerSelection === 'Existing' ? (
              <>
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Customer Category"
                      name="customerCategory"
                      options={[
                        {
                          key: 'Regular',
                          value: 'Regular',
                        },
                        {
                          key: 'Operator',
                          value: 'Operator',
                        },
                      ]}
                      value={regularRequest.customerDetails.customerCategory}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          customerDetails: {
                            customerId: regularRequest.customerDetails.customerId ?? '',
                            customerCategory: value.customerCategory.toString(),
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
                        {
                          key: 'Ramesh',
                          value: 'Ramesh',
                        },
                        {
                          key: 'Suresh',
                          value: 'Suresh',
                        },
                      ]}
                      value={regularRequest.customerDetails.customerId}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          customerDetails: {
                            customerId: value.customerId.toString(),
                            customerCategory: regularRequest.customerDetails.customerCategory ?? '',
                          },
                        })
                      }}
                    />
                  </Column>
                </Row>
              </>
            ) : (
              <>
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Customer Name"
                      name="customerName"
                      value={regularRequest.customerDetails.customerName ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          customerDetails: {
                            customerName: value.customerName?.toString() || '',
                            customerEmail: regularRequest.customerDetails.customerEmail?.toString() || '',
                            customerContact: regularRequest.customerDetails.customerContact?.toString() || '',
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
                      label="Customer Contact"
                      name="customerContact"
                      value={regularRequest.customerDetails.customerContact ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          customerDetails: {
                            customerName: regularRequest.customerDetails.customerName || '',
                            customerEmail: regularRequest.customerDetails.customerEmail || '',
                            customerContact: value.customerContact?.toString() || '',
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
                      label="Customer Email"
                      name="customerEmail"
                      value={regularRequest.customerDetails.customerEmail ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          customerDetails: {
                            customerName: regularRequest.customerDetails.customerName || '',
                            customerEmail: value.customerEmail?.toString() || '',
                            customerContact: regularRequest.customerDetails.customerContact || '',
                          },
                        })
                      }}
                    />
                  </Column>
                </Row>
              </>
            )}
          </Panel>
          <Panel
            title="Vehicle Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            {regularRequest.requestDetails.vehicleSelection === 'Existing' ? (
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Vehicle Category"
                    name="vehicleCategory"
                    options={[
                      {
                        key: 'Sedan',
                        value: 'Sedan',
                      },
                      {
                        key: 'SUV',
                        value: 'SUV',
                      },
                    ]}
                    value={regularRequest.vehicleDetails.vehicleCategory ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        vehicleDetails: {
                          vehicleId: regularRequest.vehicleDetails.vehicleId ?? '',
                          vehicleCategory: value.vehicleCategory.toString(),
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
                    label="Vehicle"
                    name="vehicleId"
                    options={[
                      {
                        key: 'Car1',
                        value: 'Car1',
                      },
                      {
                        key: 'Car2',
                        value: 'Car2',
                      },
                    ]}
                    value={regularRequest.vehicleDetails.vehicleId}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        vehicleDetails: {
                          vehicleId: value.vehicleId.toString(),
                          vehicleCategory: regularRequest.vehicleDetails.vehicleCategory ?? '',
                        },
                      })
                    }}
                  />
                </Column>
              </Row>
            ) : (
              <>
                <Row>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <TextInput
                      label="Owner Name"
                      name="ownerName"
                      value={regularRequest.vehicleDetails.ownerName ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ownerName: value.ownerName?.toString() || '',
                            ownerContact: regularRequest.vehicleDetails.ownerContact?.toString() || '',
                            ownerEmail: regularRequest.vehicleDetails.ownerEmail?.toString() || '',
                            vehicleManufacturer: regularRequest.vehicleDetails.vehicleManufacturer?.toString() || '',
                            vehicleName: regularRequest.vehicleDetails.vehicleName?.toString() || '',
                            vehicleRegistrationNumber: regularRequest.vehicleDetails.vehicleRegistrationNumber?.toString() || '',
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
                      label="Owner Contact"
                      name="ownerContact"
                      value={regularRequest.vehicleDetails.ownerContact ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ownerName: regularRequest.vehicleDetails.ownerName || '',
                            ownerContact: value.ownerContact?.toString() || '',
                            ownerEmail: regularRequest.vehicleDetails.ownerEmail || '',
                            vehicleManufacturer: regularRequest.vehicleDetails.vehicleManufacturer || '',
                            vehicleName: regularRequest.vehicleDetails.vehicleName || '',
                            vehicleRegistrationNumber: regularRequest.vehicleDetails.vehicleRegistrationNumber || '',
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
                      label="Owner Email"
                      name="ownerEmail"
                      value={regularRequest.vehicleDetails.ownerEmail ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ownerName: regularRequest.vehicleDetails.ownerName || '',
                            ownerContact: regularRequest.vehicleDetails.ownerContact || '',
                            ownerEmail: value.ownerEmail?.toString() || '',
                            vehicleManufacturer: regularRequest.vehicleDetails.vehicleManufacturer || '',
                            vehicleName: regularRequest.vehicleDetails.vehicleName || '',
                            vehicleRegistrationNumber: regularRequest.vehicleDetails.vehicleRegistrationNumber || '',
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
                      label="Vehicle Manufacturer"
                      name="vehicleManufacturer"
                      value={regularRequest.vehicleDetails.vehicleManufacturer ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ownerName: regularRequest.vehicleDetails.ownerName || '',
                            ownerContact: regularRequest.vehicleDetails.ownerContact || '',
                            ownerEmail: regularRequest.vehicleDetails.ownerEmail || '',
                            vehicleManufacturer: value.vehicleManufacturer?.toString() || '',
                            vehicleName: regularRequest.vehicleDetails.vehicleName || '',
                            vehicleRegistrationNumber: regularRequest.vehicleDetails.vehicleRegistrationNumber || '',
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
                      name="vehicleName"
                      value={regularRequest.vehicleDetails.vehicleName ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ownerName: regularRequest.vehicleDetails.ownerName || '',
                            ownerContact: regularRequest.vehicleDetails.ownerContact || '',
                            ownerEmail: regularRequest.vehicleDetails.ownerEmail || '',
                            vehicleManufacturer: regularRequest.vehicleDetails.vehicleManufacturer || '',
                            vehicleName: value.vehicleName?.toString() || '',
                            vehicleRegistrationNumber: regularRequest.vehicleDetails.vehicleRegistrationNumber || '',
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
                      label="Vehicle Registration Number"
                      name="vehicleRegistrationNumber"
                      value={regularRequest.vehicleDetails.vehicleRegistrationNumber ?? ''}
                      changeHandler={value => {
                        setRegularRequest({
                          ...regularRequest,
                          vehicleDetails: {
                            ownerName: regularRequest.vehicleDetails.ownerName || '',
                            ownerContact: regularRequest.vehicleDetails.ownerContact || '',
                            ownerEmail: regularRequest.vehicleDetails.ownerEmail || '',
                            vehicleManufacturer: regularRequest.vehicleDetails.vehicleManufacturer || '',
                            vehicleName: regularRequest.vehicleDetails.vehicleName || '',
                            vehicleRegistrationNumber: value.vehicleRegistrationNumber?.toString() || '',
                          },
                        })
                      }}
                    />
                  </Column>
                </Row>
              </>
            )}
          </Panel>
          <Panel
            title="Staff Details"
            className={bemClass([blk, 'margin-bottom'])}
          >
            {regularRequest.requestDetails.staffSelection === 'Existing' ? (
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <SelectInput
                    label="Staff Category"
                    name="staffCategory"
                    options={[
                      {
                        key: 'Driver',
                        value: 'Driver',
                      },
                      {
                        key: 'Guide',
                        value: 'Guide',
                      },
                    ]}
                    value={regularRequest.staffDetails.staffCategory ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        staffDetails: {
                          staffId: regularRequest.staffDetails.staffId ?? '',
                          staffCategory: value.staffCategory.toString(),
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
                      {
                        key: 'Driver1',
                        value: 'Driver1',
                      },
                      {
                        key: 'Driver2',
                        value: 'Driver2',
                      },
                    ]}
                    value={regularRequest.staffDetails.staffId}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        staffDetails: {
                          staffId: value.staffId.toString(),
                          staffCategory: regularRequest.staffDetails.staffCategory ?? '',
                        },
                      })
                    }}
                  />
                </Column>
              </Row>
            ) : (
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextInput
                    label="Staff Name"
                    name="staffName"
                    value={regularRequest.staffDetails.staffName ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        staffDetails: {
                          staffName: value.staffName?.toString() || '',
                          staffEmail: regularRequest.staffDetails.staffEmail?.toString() || '',
                          staffLicense: regularRequest.staffDetails.staffLicense?.toString() || '',
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
                    label="Staff Email"
                    name="staffEmail"
                    value={regularRequest.staffDetails.staffEmail ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        staffDetails: {
                          staffName: regularRequest.staffDetails.staffName || '',
                          staffEmail: value.staffEmail?.toString() || '',
                          staffLicense: regularRequest.staffDetails.staffLicense || '',
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
                    label="Staff License"
                    name="staffLicense"
                    value={regularRequest.staffDetails.staffLicense ?? ''}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        staffDetails: {
                          staffName: regularRequest.staffDetails.staffName || '',
                          staffEmail: regularRequest.staffDetails.staffEmail || '',
                          staffLicense: value.staffLicense?.toString() || '',
                        },
                      })
                    }}
                  />
                </Column>
              </Row>
            )}
          </Panel>
          <Panel
            title="Customer package details"
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
                    {
                      key: 'Package 1',
                      value: 'Package 1',
                    },
                    {
                      key: 'Package 2',
                      value: 'Package 2',
                    },
                  ]}
                  value={regularRequest.customerPackageDetails.packageCategory}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      customerPackageDetails: {
                        packageCategory: value.packageCategory.toString(),
                        packageId: regularRequest.customerPackageDetails.packageId.toString(),
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
                    {
                      key: 'Package 1',
                      value: 'Package 1',
                    },
                    {
                      key: 'Package 2',
                      value: 'Package 2',
                    },
                  ]}
                  value={regularRequest.customerPackageDetails.packageId}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      customerPackageDetails: {
                        packageCategory: regularRequest.customerPackageDetails.packageCategory ?? '',
                        packageId: value.packageId.toString(),
                      },
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>
          <Panel
            title="Other Charges"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <div className={bemClass([blk, 'custom-label'])}>
                  <Text
                    tag="p"
                    typography="s"
                    color="gray-darker"
                  >
                    Toll
                  </Text>
                  <CheckBox
                    id="tollChargeableToCustomer"
                    label="Chargeable to customer"
                    checked={regularRequest.otherCharges.toll.chargeableToCustomer}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        otherCharges: {
                          ...regularRequest.otherCharges,
                          toll: {
                            ...regularRequest.otherCharges.toll,
                            chargeableToCustomer: value.tollChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="toll"
                  placeholder="Toll"
                  value={regularRequest.otherCharges.toll.charge}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        toll: {
                          ...regularRequest.otherCharges.toll,
                          charge: value.tollCharges ? Number(value.tollCharges) : 0,
                        },
                      },
                    })
                  }}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <div className={bemClass([blk, 'custom-label'])}>
                  <Text
                    tag="p"
                    typography="s"
                    color="gray-darker"
                  >
                    Parking
                  </Text>
                  <CheckBox
                    id="parkingChargeableToCustomer"
                    label="Chargeable to customer"
                    checked={regularRequest.otherCharges.parking.chargeableToCustomer}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        otherCharges: {
                          ...regularRequest.otherCharges,
                          parking: {
                            ...regularRequest.otherCharges.parking,
                            chargeableToCustomer: value.parkingChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="parking"
                  placeholder="Parking"
                  value={regularRequest.otherCharges.parking.charge}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        parking: {
                          ...regularRequest.otherCharges.parking,
                          charge: value.parking ? Number(value.parking) : 0,
                        },
                      },
                    })
                  }}
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <div className={bemClass([blk, 'custom-label'])}>
                  <Text
                    tag="p"
                    typography="s"
                    color="gray-darker"
                  >
                    Night Halt
                  </Text>
                  <CheckBox
                    id="nightHaltChargeableToCustomer"
                    label="Chargeable to customer"
                    checked={regularRequest.otherCharges.nightHalt.chargeableToCustomer}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        otherCharges: {
                          ...regularRequest.otherCharges,
                          nightHalt: {
                            ...regularRequest.otherCharges.nightHalt,
                            chargeableToCustomer: value.nightHaltChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="nightHalt"
                  placeholder="Night Halt"
                  value={regularRequest.otherCharges.nightHalt.charge}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        nightHalt: {
                          ...regularRequest.otherCharges.nightHalt,
                          charge: value.nightHalt ? Number(value.nightHalt) : 0,
                        },
                      },
                    })
                  }}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Include Night Halt in driver salary?"
                  name="includeNightHaltInDriverSalary"
                  options={['Yes', 'No']}
                  value={regularRequest.otherCharges.nightHalt.includeInDriverSalary ? 'Yes' : 'No'}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        nightHalt: {
                          ...regularRequest.otherCharges.nightHalt,
                          includeInDriverSalary: value.includeNightHaltInDriverSalary === 'Yes',
                        },
                      },
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <div className={bemClass([blk, 'custom-label'])}>
                  <Text
                    tag="p"
                    typography="s"
                    color="gray-darker"
                  >
                    Driver Allowance
                  </Text>
                  <CheckBox
                    id="driverAllowanceChargeableToCustomer"
                    label="Chargeable to customer"
                    checked={regularRequest.otherCharges.driverAllowance.chargeableToCustomer}
                    changeHandler={value => {
                      setRegularRequest({
                        ...regularRequest,
                        otherCharges: {
                          ...regularRequest.otherCharges,
                          driverAllowance: {
                            ...regularRequest.otherCharges.driverAllowance,
                            chargeableToCustomer: value.driverAllowanceChargeableToCustomer ?? false,
                          },
                        },
                      })
                    }}
                  />
                </div>
                <TextInput
                  name="driverAllowance"
                  placeholder="Driver Allowance"
                  value={regularRequest.otherCharges.driverAllowance.charge}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        driverAllowance: {
                          ...regularRequest.otherCharges.driverAllowance,
                          charge: value.driverAllowance ? Number(value.driverAllowance) : 0,
                        },
                      },
                    })
                  }}
                />
              </Column>
              <Column
                col={5}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <RadioGroup
                  question="Include Driver Allowance in driver salary?"
                  name="includeDriverAllowanceInDriverSalary"
                  options={['Yes', 'No']}
                  value={regularRequest.otherCharges.driverAllowance.includeInDriverSalary ? 'Yes' : 'No'}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      otherCharges: {
                        ...regularRequest.otherCharges,
                        driverAllowance: {
                          ...regularRequest.otherCharges.driverAllowance,
                          includeInDriverSalary: value.includeDriverAllowanceInDriverSalary === 'Yes',
                        },
                      },
                    })
                  }}
                  direction="horizontal"
                />
              </Column>
            </Row>
          </Panel>
          <Panel
            title="Advance Payment"
            className={bemClass([blk, 'margin-bottom'])}
          >
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Advance from Customer"
                  name="advanceFromCustomer"
                  value={regularRequest.advancePayment.advanceFromCustomer}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      advancePayment: {
                        ...regularRequest.advancePayment,
                        advanceFromCustomer: value.advanceFromCustomer ? Number(value.advanceFromCustomer) : 0,
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
                  label="Advance to Driver"
                  name="advanceToDriver"
                  value={regularRequest.advancePayment.advanceToDriver}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      advancePayment: {
                        ...regularRequest.advancePayment,
                        advanceToDriver: value.advanceToDriver ? Number(value.advanceToDriver) : 0,
                      },
                    })
                  }}
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
                <SelectInput
                  label="Payment Status"
                  name="PaymentStatus"
                  options={[
                    {
                      key: 'Bill Generated',
                      value: 'Bill Generated',
                    },
                    {
                      key: 'Send to customer',
                      value: 'Send to customer',
                    },
                    {
                      key: 'Payment Received',
                      value: 'Payment Received',
                    },
                  ]}
                  value={regularRequest.paymentDetails.status}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      paymentDetails: {
                        ...regularRequest.paymentDetails,
                        status: value.PaymentStatus?.toString() ?? '',
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
                  label="Payment Date"
                  name="paymentDate"
                  type="date"
                  value={regularRequest.paymentDetails.paymentDate ? new Date(regularRequest.paymentDetails.paymentDate).toISOString().slice(0, 10) : ''}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      paymentDetails: {
                        ...regularRequest.paymentDetails,
                        paymentDate: value.paymentDate ? new Date(value.paymentDate) : null,
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
                  label="Payment Mode"
                  name="paymentMode"
                  options={[
                    {
                      key: 'Cash',
                      value: 'Cash',
                    },
                    {
                      key: 'Card',
                      value: 'Card',
                    },
                    {
                      key: 'Online Transfer',
                      value: 'Online Transfer',
                    },
                  ]}
                  value={regularRequest.paymentDetails.paymentMode}
                  changeHandler={value => {
                    setRegularRequest({
                      ...regularRequest,
                      paymentDetails: {
                        ...regularRequest.paymentDetails,
                        paymentMode: value.paymentMode?.toString() ?? '',
                      },
                    })
                  }}
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
              name="comments"
              value={regularRequest.comments}
              changeHandler={value => {
                setRegularRequest({
                  ...regularRequest,
                  comments: value.comments?.toString() ?? '',
                })
              }}
              placeholder="Enter any additional comments or notes here..."
            />
          </Panel>
        </>
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

export default CreateRegularRequest
