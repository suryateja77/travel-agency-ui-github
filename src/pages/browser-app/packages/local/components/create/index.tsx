import React, { FunctionComponent, useState } from 'react'
import { Breadcrumb, Text, Panel, Row, Column, TextInput, CheckBox, Button, TextArea } from '@base'
import { PackageModel } from '@types'
import { bemClass } from '@utils'

import './style.scss'

const blk = 'create-package'

interface CreatePackageProps {}

const CreatePackage: FunctionComponent<CreatePackageProps> = () => {
  const [packageData, setPackageData] = useState<PackageModel>({
    packageDetails: {
      packageCode: '',
      minimumKm: 0,
      minimumHours: 0,
      basicAmount: 0,
      extraKmRate: 0,
      extraHoursRate: 0,
      comments: '',
    },
    statusDetails: {
      isActive: true,
    },
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
          New Package
        </Text>
        <Breadcrumb data={[{ label: 'Home', route: '/dashboard' }, { label: 'Packages', route: '/packages/local' }, { label: 'New Package' }]} />
      </div>
      <div className={bemClass([blk, 'content'])}>
        <Panel
          title="Package Details"
          className={bemClass([blk, 'margin-bottom'])}
        >
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Package Code"
                name="packageCode"
                value={packageData.packageDetails.packageCode}
                changeHandler={v =>
                  setPackageData({
                    ...packageData,
                    packageDetails: {
                      ...packageData.packageDetails,
                      packageCode: v.packageCode?.toString() ?? '',
                    },
                  })
                }
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Minimum Km"
                name="minimumKm"
                type="number"
                value={packageData.packageDetails.minimumKm ?? ''}
                changeHandler={v =>
                  setPackageData({
                    ...packageData,
                    packageDetails: {
                      ...packageData.packageDetails,
                      minimumKm: v.minimumKm ? Number(v.minimumKm) : 0,
                    },
                  })
                }
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Minimum Hours"
                name="minimumHours"
                type="number"
                value={packageData.packageDetails.minimumHours ?? ''}
                changeHandler={v =>
                  setPackageData({
                    ...packageData,
                    packageDetails: {
                      ...packageData.packageDetails,
                      minimumHours: v.minimumHours ? Number(v.minimumHours) : 0,
                    },
                  })
                }
              />
            </Column>
          </Row>
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Basic Amount"
                name="basicAmount"
                type="number"
                value={packageData.packageDetails.basicAmount ?? ''}
                changeHandler={v =>
                  setPackageData({
                    ...packageData,
                    packageDetails: {
                      ...packageData.packageDetails,
                      basicAmount: v.basicAmount ? Number(v.basicAmount) : 0,
                    },
                  })
                }
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Extra Km Rate"
                name="extraKmRate"
                type="number"
                value={packageData.packageDetails.extraKmRate ?? ''}
                changeHandler={v =>
                  setPackageData({
                    ...packageData,
                    packageDetails: {
                      ...packageData.packageDetails,
                      extraKmRate: v.extraKmRate ? Number(v.extraKmRate) : 0,
                    },
                  })
                }
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Extra Hours Rate"
                name="extraHoursRate"
                type="number"
                value={packageData.packageDetails.extraHoursRate ?? ''}
                changeHandler={v =>
                  setPackageData({
                    ...packageData,
                    packageDetails: {
                      ...packageData.packageDetails,
                      extraHoursRate: v.extraHoursRate ? Number(v.extraHoursRate) : 0,
                    },
                  })
                }
              />
            </Column>
          </Row>
          <Row>
            <Column
              col={12}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextArea
                label="Comments"
                name="comments"
                value={packageData.packageDetails.comments}
                changeHandler={v =>
                  setPackageData({
                    ...packageData,
                    packageDetails: {
                      ...packageData.packageDetails,
                      comments: v.comments?.toString() ?? '',
                    },
                  })
                }
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
              <CheckBox
                id="isActive"
                label="Is Active"
                checked={packageData.statusDetails.isActive}
                changeHandler={obj =>
                  setPackageData({
                    ...packageData,
                    statusDetails: {
                      ...packageData.statusDetails,
                      isActive: !!obj.isActive,
                    },
                  })
                }
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

export default CreatePackage
