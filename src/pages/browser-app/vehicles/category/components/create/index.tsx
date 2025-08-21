import React, { FunctionComponent, useState } from 'react'
import { Breadcrumb, Text, Panel, Row, Column, TextInput, CheckBox, Button, SelectInput, TextArea, ConfirmationPopup, Modal, Alert, Toggle } from '@base'
import { VehicleModel } from '@types'
import { bemClass, pathToName, validatePayload } from '@utils'

import './style.scss'
import { useNavigate } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreateVehicleMutation } from '@api/queries/vehicle'

const blk = 'create-vehicle'

interface CreateVehicleProps {
  category?: string
}

const CreateVehicle: FunctionComponent<CreateVehicleProps> = ({ category = '' }) => {
  const sampleVehicleModel: VehicleModel = {
    type: '',
    manufacturer: '',
    name: '',
    noOfSeats: '',
    registrationNo: '',
    hasAc: false,
    isMonthlyFixed: false,
    monthlyFixedDetails: undefined,
    category: '',
    isActive: true,
    comments: '',
  }
  const navigate = useNavigate()
  const createVehicle = useCreateVehicleMutation()

  const [vehicle, setVehicle] = useState<VehicleModel>(sampleVehicleModel)
  const [isEditing, setIsEditing] = useState(false)
  const [vehicleId, setVehicleId] = useState('')

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New user role created successfully!')

  const [errorMap, setErrorMap] = useState<Record<string, any>>(sampleVehicleModel)
  const [isValidationError, setIsValidationError] = useState(false)

  const navigateBack = () => {
    // Route to the VehicleList page
    navigate(`/vehicles/${category}`)
  }

  const closeConfirmationPopUp = () => {
    if (showConfirmationModal) {
      setShowConfirmationModal(false)
    }
  }

  const submitHandler = async () => {
    const validationSchema = createValidationSchema(vehicle)
    const { isValid, errorMap } = validatePayload(validationSchema, vehicle)

    setIsValidationError(!isValid)
    setErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        if (isEditing) {
          // await updateAgent.mutateAsync({ _id: agentId, ...agent })
          setConfirmationPopUpType('update')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('Vehicle updated successfully!')
        } else {
          await createVehicle.mutateAsync({ ...vehicle, category })
          setConfirmationPopUpType('create')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('New Vehicle created successfully!')
        }

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to create/Update vehicle', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Failed')
        setConfirmationPopUpSubtitle(`Unable to ${isEditing ? 'update' : 'create'} vehicle, please try again.`)
      }
    } else {
      console.log('Create Vehicle: Validation Error', errorMap)
    }
  }

  return (
    <>
      <div className={bemClass([blk])}>
        <div className={bemClass([blk, 'header'])}>
          <Text
            color="gray-darker"
            typography="l"
          >
            {`New ${pathToName(category)} Vehicle`}
          </Text>
          <Breadcrumb
            data={[
              {
                label: 'Home',
                route: '/dashboard',
              },
              {
                label: `${pathToName(category)} Vehicles`,
                route: `/vehicles/${category}`,
              },
              {
                label: `New ${pathToName(category)} Vehicle`,
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
                  name="type"
                  options={[
                    { key: 'Sedan', value: 'Sedan' },
                    { key: 'SUV', value: 'SUV' },
                    { key: 'Hatchback', value: 'Hatchback' },
                    { key: 'Bus', value: 'Bus' },
                  ]}
                  value={vehicle.type}
                  changeHandler={value => {
                    setVehicle({
                      ...vehicle,
                      type: value.type?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['type']}
                  invalid={errorMap['type']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Manufacturer"
                  name="manufacturer"
                  value={vehicle.manufacturer}
                  changeHandler={value => {
                    setVehicle({
                      ...vehicle,
                      manufacturer: value.manufacturer?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['manufacturer']}
                  invalid={errorMap['manufacturer']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Vehicle Name"
                  name="name"
                  value={vehicle.name}
                  changeHandler={value => {
                    setVehicle({
                      ...vehicle,
                      name: value.name?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['name']}
                  invalid={errorMap['name']}
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
                  name="noOfSeats"
                  type="number"
                  value={vehicle.noOfSeats ?? ''}
                  changeHandler={value => {
                    setVehicle({
                      ...vehicle,
                      noOfSeats: value.noOfSeats ? Number(value.noOfSeats) : '',
                    })
                  }}
                  required
                  errorMessage={errorMap['noOfSeats']}
                  invalid={errorMap['noOfSeats']}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Registration Number"
                  name="registrationNo"
                  value={vehicle.registrationNo}
                  changeHandler={value => {
                    setVehicle({
                      ...vehicle,
                      registrationNo: value.registrationNo?.toString() ?? '',
                    })
                  }}
                  required
                  errorMessage={errorMap['registrationNo']}
                  invalid={errorMap['registrationNo']}
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <Toggle
                  name="hasAc"
                  label='Is AC Required'
                  checked={vehicle.hasAc}
                  changeHandler={obj => {
                    setVehicle({
                      ...vehicle,
                      hasAc: !!obj.hasAc,
                    })
                  }}
                />
              </Column>
              <Column
                col={4}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <Toggle
                  name="isMonthlyFixed"
                  label='Is Monthly Fixed'
                  checked={vehicle.isMonthlyFixed}
                  changeHandler={obj =>
                    setVehicle({
                      ...vehicle,
                      isMonthlyFixed: !!obj.isMonthlyFixed,
                      // Reset monthly fixed details when toggling off
                      monthlyFixedDetails: obj.isMonthlyFixed ? vehicle.monthlyFixedDetails : undefined,
                    })
                  }
                />
              </Column>
            </Row>
          </Panel>

          {vehicle.isMonthlyFixed && (
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
                      value={vehicle.monthlyFixedDetails?.customerCategory ?? ''}
                      changeHandler={value => {
                        setVehicle({
                          ...vehicle,
                          monthlyFixedDetails: {
                            customerCategory: value.customerCategory?.toString() ?? '',
                            customer: vehicle.monthlyFixedDetails?.customer ?? '',
                            packageCategory: vehicle.monthlyFixedDetails?.packageCategory ?? '',
                            package: vehicle.monthlyFixedDetails?.package ?? '',
                            staffCategory: vehicle.monthlyFixedDetails?.staffCategory ?? '',
                            staff: vehicle.monthlyFixedDetails?.staff ?? '',
                            contractStartDate: vehicle.monthlyFixedDetails?.contractStartDate ?? new Date(),
                            contractEndDate: vehicle.monthlyFixedDetails?.contractEndDate ?? new Date(),
                          },
                        })
                      }}
                      required={vehicle.isMonthlyFixed}
                      errorMessage={errorMap['monthlyFixedDetails.customerCategory']}
                      invalid={errorMap['monthlyFixedDetails.customerCategory']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Customer"
                      name="customer"
                      options={[
                        { key: 'Ramesh', value: 'Ramesh' },
                        { key: 'Suresh', value: 'Suresh' },
                      ]}
                      value={vehicle.monthlyFixedDetails?.customer ?? ''}
                      changeHandler={value => {
                        setVehicle({
                          ...vehicle,
                          monthlyFixedDetails: {
                            customerCategory: vehicle.monthlyFixedDetails?.customerCategory ?? '',
                            customer: value.customer?.toString() ?? '',
                            packageCategory: vehicle.monthlyFixedDetails?.packageCategory ?? '',
                            package: vehicle.monthlyFixedDetails?.package ?? '',
                            staffCategory: vehicle.monthlyFixedDetails?.staffCategory ?? '',
                            staff: vehicle.monthlyFixedDetails?.staff ?? '',
                            contractStartDate: vehicle.monthlyFixedDetails?.contractStartDate ?? new Date(),
                            contractEndDate: vehicle.monthlyFixedDetails?.contractEndDate ?? new Date(),
                          },
                        })
                      }}
                      required={vehicle.isMonthlyFixed}
                      errorMessage={errorMap['monthlyFixedDetails.customer']}
                      invalid={errorMap['monthlyFixedDetails.customer']}
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
                      value={vehicle.monthlyFixedDetails?.packageCategory ?? ''}
                      changeHandler={value => {
                        setVehicle({
                          ...vehicle,
                          monthlyFixedDetails: {
                            customerCategory: vehicle.monthlyFixedDetails?.customerCategory ?? '',
                            customer: vehicle.monthlyFixedDetails?.customer ?? '',
                            packageCategory: value.packageCategory?.toString() ?? '',
                            package: vehicle.monthlyFixedDetails?.package ?? '',
                            staffCategory: vehicle.monthlyFixedDetails?.staffCategory ?? '',
                            staff: vehicle.monthlyFixedDetails?.staff ?? '',
                            contractStartDate: vehicle.monthlyFixedDetails?.contractStartDate ?? new Date(),
                            contractEndDate: vehicle.monthlyFixedDetails?.contractEndDate ?? new Date(),
                          },
                        })
                      }}
                      required={vehicle.isMonthlyFixed}
                      errorMessage={errorMap['monthlyFixedDetails.packageCategory']}
                      invalid={errorMap['monthlyFixedDetails.packageCategory']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Package"
                      name="package"
                      options={[
                        { key: 'Package 1', value: 'Package 1' },
                        { key: 'Package 2', value: 'Package 2' },
                      ]}
                      value={vehicle.monthlyFixedDetails?.package ?? ''}
                      changeHandler={value => {
                        setVehicle({
                          ...vehicle,
                          monthlyFixedDetails: {
                            customerCategory: vehicle.monthlyFixedDetails?.customerCategory ?? '',
                            customer: vehicle.monthlyFixedDetails?.customer ?? '',
                            packageCategory: vehicle.monthlyFixedDetails?.packageCategory ?? '',
                            package: value.package?.toString() ?? '',
                            staffCategory: vehicle.monthlyFixedDetails?.staffCategory ?? '',
                            staff: vehicle.monthlyFixedDetails?.staff ?? '',
                            contractStartDate: vehicle.monthlyFixedDetails?.contractStartDate ?? new Date(),
                            contractEndDate: vehicle.monthlyFixedDetails?.contractEndDate ?? new Date(),
                          },
                        })
                      }}
                      required={vehicle.isMonthlyFixed}
                      errorMessage={errorMap['monthlyFixedDetails.package']}
                      invalid={errorMap['monthlyFixedDetails.package']}
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
                      value={vehicle.monthlyFixedDetails?.staffCategory ?? ''}
                      changeHandler={value => {
                        setVehicle({
                          ...vehicle,
                          monthlyFixedDetails: {
                            customerCategory: vehicle.monthlyFixedDetails?.customerCategory ?? '',
                            customer: vehicle.monthlyFixedDetails?.customer ?? '',
                            packageCategory: vehicle.monthlyFixedDetails?.packageCategory ?? '',
                            package: vehicle.monthlyFixedDetails?.package ?? '',
                            staffCategory: value.staffCategory?.toString() ?? '',
                            staff: vehicle.monthlyFixedDetails?.staff ?? '',
                            contractStartDate: vehicle.monthlyFixedDetails?.contractStartDate ?? new Date(),
                            contractEndDate: vehicle.monthlyFixedDetails?.contractEndDate ?? new Date(),
                          },
                        })
                      }}
                      required={vehicle.isMonthlyFixed}
                      errorMessage={errorMap['monthlyFixedDetails.staffCategory']}
                      invalid={errorMap['monthlyFixedDetails.staffCategory']}
                    />
                  </Column>
                  <Column
                    col={4}
                    className={bemClass([blk, 'margin-bottom'])}
                  >
                    <SelectInput
                      label="Staff"
                      name="staff"
                      options={[
                        { key: 'Driver1', value: 'Driver1' },
                        { key: 'Driver2', value: 'Driver2' },
                      ]}
                      value={vehicle.monthlyFixedDetails?.staff ?? ''}
                      changeHandler={value => {
                        setVehicle({
                          ...vehicle,
                          monthlyFixedDetails: {
                            customerCategory: vehicle.monthlyFixedDetails?.customerCategory ?? '',
                            customer: vehicle.monthlyFixedDetails?.customer ?? '',
                            packageCategory: vehicle.monthlyFixedDetails?.packageCategory ?? '',
                            package: vehicle.monthlyFixedDetails?.package ?? '',
                            staffCategory: vehicle.monthlyFixedDetails?.staffCategory ?? '',
                            staff: value.staff?.toString() ?? '',
                            contractStartDate: vehicle.monthlyFixedDetails?.contractStartDate ?? new Date(),
                            contractEndDate: vehicle.monthlyFixedDetails?.contractEndDate ?? new Date(),
                          },
                        })
                      }}
                      required={vehicle.isMonthlyFixed}
                      errorMessage={errorMap['monthlyFixedDetails.staff']}
                      invalid={errorMap['monthlyFixedDetails.staff']}
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
                      value={vehicle.monthlyFixedDetails?.contractStartDate ? new Date(vehicle.monthlyFixedDetails.contractStartDate).toISOString().slice(0, 10) : ''}
                      changeHandler={value => {
                        setVehicle({
                          ...vehicle,
                          monthlyFixedDetails: {
                            customerCategory: vehicle.monthlyFixedDetails?.customerCategory ?? '',
                            customer: vehicle.monthlyFixedDetails?.customer ?? '',
                            packageCategory: vehicle.monthlyFixedDetails?.packageCategory ?? '',
                            package: vehicle.monthlyFixedDetails?.package ?? '',
                            staffCategory: vehicle.monthlyFixedDetails?.staffCategory ?? '',
                            staff: vehicle.monthlyFixedDetails?.staff ?? '',
                            contractStartDate: value.contractStartDate ? new Date(value.contractStartDate) : new Date(),
                            contractEndDate: vehicle.monthlyFixedDetails?.contractEndDate ?? new Date(),
                          },
                        })
                      }}
                      required={vehicle.isMonthlyFixed}
                      errorMessage={errorMap['monthlyFixedDetails.contractStartDate']}
                      invalid={errorMap['monthlyFixedDetails.contractStartDate']}
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
                      value={vehicle.monthlyFixedDetails?.contractEndDate ? new Date(vehicle.monthlyFixedDetails.contractEndDate).toISOString().slice(0, 10) : ''}
                      changeHandler={value => {
                        setVehicle({
                          ...vehicle,
                          monthlyFixedDetails: {
                            customerCategory: vehicle.monthlyFixedDetails?.customerCategory ?? '',
                            customer: vehicle.monthlyFixedDetails?.customer ?? '',
                            packageCategory: vehicle.monthlyFixedDetails?.packageCategory ?? '',
                            package: vehicle.monthlyFixedDetails?.package ?? '',
                            staffCategory: vehicle.monthlyFixedDetails?.staffCategory ?? '',
                            staff: vehicle.monthlyFixedDetails?.staff ?? '',
                            contractStartDate: vehicle.monthlyFixedDetails?.contractStartDate ?? new Date(),
                            contractEndDate: value.contractEndDate ? new Date(value.contractEndDate) : new Date(),
                          },
                        })
                      }}
                      required={vehicle.isMonthlyFixed}
                      errorMessage={errorMap['monthlyFixedDetails.contractEndDate']}
                      invalid={errorMap['monthlyFixedDetails.contractEndDate']}
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
                  checked={vehicle.isActive}
                  changeHandler={obj => {
                    setVehicle({
                      ...vehicle,
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
    </>
  )
}

export default CreateVehicle
