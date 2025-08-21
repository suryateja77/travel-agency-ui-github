import { FunctionComponent, useState } from 'react'
import { Panel, Row, Column, TextInput, Button, TextArea, ConfirmationPopup, Modal, Alert, Toggle, Breadcrumb } from '@base'
import { PageHeader } from '@components'
import { PackageModel } from '@types'
import { bemClass, pathToName, validatePayload } from '@utils'

import './style.scss'
import { useNavigate } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreatePackageMutation } from '@api/queries/package'

const blk = 'create-package'

interface CreatePackageProps {
  category?: string
}

const CreatePackage: FunctionComponent<CreatePackageProps> = ({ category = '' }) => {
  const samplePackageModel: PackageModel = {
    category: '',
    packageCode: '',
    minimumKm: '',
    minimumHr: '',
    baseAmount: '',
    extraKmPerKmRate: '',
    extraHrPerHrRate: '',
    comment: '',
    isActive: true,
  }
  const navigate = useNavigate()
  const createPackage = useCreatePackageMutation()

  const [packageData, setPackageData] = useState<PackageModel>(samplePackageModel)
  const [isEditing, setIsEditing] = useState(false)
  const [packageId, setPackageId] = useState('')

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationPopUpType, setConfirmationPopUpType] = useState<'create' | 'update' | 'delete'>('create')
  const [confirmationPopUpTitle, setConfirmationPopUpTitle] = useState('Created')
  const [confirmationPopUpSubtitle, setConfirmationPopUpSubtitle] = useState('New package created successfully!')

  const [errorMap, setErrorMap] = useState<Record<string, any>>(samplePackageModel)
  const [isValidationError, setIsValidationError] = useState(false)

  const navigateBack = () => {
    // Route to the PackagesList page
    navigate(`/packages/${category}`)
  }

  const closeConfirmationPopUp = () => {
    if (showConfirmationModal) {
      setShowConfirmationModal(false)
    }
  }

  const submitHandler = async () => {
    const validationSchema = createValidationSchema(packageData)
    const { isValid, errorMap } = validatePayload(validationSchema, packageData)

    setIsValidationError(!isValid)
    setErrorMap(errorMap)
    if (isValid) {
      setIsValidationError(false)
      try {
        if (isEditing) {
          // await updatePackage.mutateAsync({ _id: packageId, ...packageData })
          setConfirmationPopUpType('update')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('Package updated successfully!')
        } else {
          await createPackage.mutateAsync({ ...packageData, category })
          setConfirmationPopUpType('create')
          setConfirmationPopUpTitle('Success')
          setConfirmationPopUpSubtitle('New Package created successfully!')
        }

        setTimeout(() => {
          setShowConfirmationModal(true)
        }, 500)
      } catch (error) {
        console.log('Unable to create/Update package', error)
        setConfirmationPopUpType('delete')
        setConfirmationPopUpTitle('Failed')
        setConfirmationPopUpSubtitle(`Unable to ${isEditing ? 'update' : 'create'} package, please try again.`)
      }
    } else {
      console.log('Create Package: Validation Error', errorMap)
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
            route: `/packages/${category}`,
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
          title="Package details"
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
                value={packageData.packageCode}
                changeHandler={value => {
                  setPackageData({
                    ...packageData,
                    packageCode: value.packageCode?.toString() ?? '',
                  })
                }}
                required
                errorMessage={errorMap['packageCode']}
                invalid={errorMap['packageCode']}
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
                value={packageData.minimumKm ?? ''}
                changeHandler={value => {
                  setPackageData({
                    ...packageData,
                    minimumKm: value.minimumKm ? Number(value.minimumKm) : '',
                  })
                }}
                required
                errorMessage={errorMap['minimumKm']}
                invalid={errorMap['minimumKm']}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Minimum Hours"
                name="minimumHr"
                type="number"
                value={packageData.minimumHr ?? ''}
                changeHandler={value => {
                  setPackageData({
                    ...packageData,
                    minimumHr: value.minimumHr ? Number(value.minimumHr) : '',
                  })
                }}
                required
                errorMessage={errorMap['minimumHr']}
                invalid={errorMap['minimumHr']}
              />
            </Column>
          </Row>
          <Row>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Base Amount"
                name="baseAmount"
                type="number"
                value={packageData.baseAmount ?? ''}
                changeHandler={value => {
                  setPackageData({
                    ...packageData,
                    baseAmount: value.baseAmount ? Number(value.baseAmount) : '',
                  })
                }}
                required
                errorMessage={errorMap['baseAmount']}
                invalid={errorMap['baseAmount']}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Extra Km Per Km Rate"
                name="extraKmPerKmRate"
                type="number"
                value={packageData.extraKmPerKmRate ?? ''}
                changeHandler={value => {
                  setPackageData({
                    ...packageData,
                    extraKmPerKmRate: value.extraKmPerKmRate ? Number(value.extraKmPerKmRate) : '',
                  })
                }}
                required
                errorMessage={errorMap['extraKmPerKmRate']}
                invalid={errorMap['extraKmPerKmRate']}
              />
            </Column>
            <Column
              col={4}
              className={bemClass([blk, 'margin-bottom'])}
            >
              <TextInput
                label="Extra Hr Per Hr Rate"
                name="extraHrPerHrRate"
                type="number"
                value={packageData.extraHrPerHrRate ?? ''}
                changeHandler={value => {
                  setPackageData({
                    ...packageData,
                    extraHrPerHrRate: value.extraHrPerHrRate ? Number(value.extraHrPerHrRate) : '',
                  })
                }}
                required
                errorMessage={errorMap['extraHrPerHrRate']}
                invalid={errorMap['extraHrPerHrRate']}
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
            value={packageData.comment || ''}
            changeHandler={value => {
              setPackageData({
                ...packageData,
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
                checked={packageData.isActive}
                changeHandler={obj => {
                  setPackageData({
                    ...packageData,
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

export default CreatePackage
