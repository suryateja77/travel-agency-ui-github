import React, { FunctionComponent, useEffect, useState, useMemo, useCallback, useReducer } from 'react'
import { Panel, Row, Column, TextInput, Button, TextArea, ConfirmationPopup, Modal, Alert, Toggle, Breadcrumb, Text } from '@base'
import { PageHeader } from '@components'
import { PackageModel } from '@types'
import { bemClass, pathToName, nameToPath, validatePayload } from '@utils'

import './style.scss'
import { useNavigate, useParams } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreatePackageMutation, usePackageByIdQuery, useUpdatePackageMutation } from '@api/queries/package'
import Loader from '@components/loader'

const blk = 'create-package'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

interface PackageResponseModel extends PackageModel {
  _id: string
}

interface CreatePackageProps {
  category?: string
}

interface ValidationErrors {
  [key: string]: string
}

interface ConfirmationModal {
  show: boolean
  type: 'create' | 'update' | 'delete'
  title: string
  subtitle: string
}

// State interface for useReducer
interface FormState {
  package: PackageModel
  isEditing: boolean
  packageId: string
  validationErrors: ValidationErrors
  isValidationError: boolean
  showConfirmationModal: boolean
  confirmationModal: ConfirmationModal
}

// Action types for useReducer
type FormAction =
  | { type: 'SET_PACKAGE'; payload: PackageModel }
  | { type: 'UPDATE_PACKAGE_FIELD'; payload: { field: keyof PackageModel; value: any } }
  | { type: 'SET_EDITING_MODE'; payload: { isEditing: boolean; packageId: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }
  | { type: 'SET_CONFIRMATION_MODAL'; payload: Partial<ConfirmationModal> & { show: boolean } }

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_PACKAGE: PackageModel = {
  category: '',
  packageCode: '',
  minimumKm: '',
  minimumHr: '',
  baseAmount: '',
  extraKmPerKmRate: '',
  extraHrPerHrRate: '',
  comment: '',
  isActive: true,
} as const

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================

const initialState: FormState = {
  package: INITIAL_PACKAGE,
  isEditing: false,
  packageId: '',
  validationErrors: {},
  isValidationError: false,
  showConfirmationModal: false,
  confirmationModal: {
    show: false,
    type: 'create',
    title: '',
    subtitle: '',
  },
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_PACKAGE':
      return { ...state, package: action.payload }
    
    case 'UPDATE_PACKAGE_FIELD':
      return {
        ...state,
        package: { ...state.package, [action.payload.field]: action.payload.value },
      }
    
    case 'SET_EDITING_MODE':
      return {
        ...state,
        isEditing: action.payload.isEditing,
        packageId: action.payload.packageId,
      }
    
    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload.errors,
        isValidationError: action.payload.hasError,
      }
    
    case 'SET_CONFIRMATION_MODAL':
      return {
        ...state,
        showConfirmationModal: action.payload.show,
        confirmationModal: { ...state.confirmationModal, ...action.payload },
      }
    
    default:
      return state
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const transformPackageResponse = (response: PackageResponseModel, category: string): PackageModel => ({
  category: response.category || nameToPath(category),
  packageCode: response.packageCode || '',
  minimumKm: response.minimumKm || '',
  minimumHr: response.minimumHr || '',
  baseAmount: response.baseAmount || '',
  extraKmPerKmRate: response.extraKmPerKmRate || '',
  extraHrPerHrRate: response.extraHrPerHrRate || '',
  comment: response.comment || '',
  isActive: response.isActive !== undefined ? response.isActive : true,
})

const CreatePackage: FunctionComponent<CreatePackageProps> = ({ category = '' }) => {
  const navigate = useNavigate()
  const params = useParams()
  
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    package: {
      ...INITIAL_PACKAGE,
      category: nameToPath(category),
    },
  })
  
  const {
    package: packageData,
    isEditing,
    packageId,
    validationErrors,
    isValidationError,
    showConfirmationModal,
    confirmationModal,
  } = state

  // API Hooks
  const createPackage = useCreatePackageMutation()
  const updatePackage = useUpdatePackageMutation()
  const { data: packageDataResponse, isLoading, error: getPackageError } = usePackageByIdQuery(params.id || '')

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePackageFieldChange = useCallback(
    <K extends keyof PackageModel>(field: K, value: PackageModel[K]) => {
      dispatch({ type: 'UPDATE_PACKAGE_FIELD', payload: { field, value } })
    },
    []
  )

  const navigateBack = useCallback(() => {
    navigate(`/packages/${category}`)
  }, [navigate, category])

  const closeConfirmationModal = useCallback(() => {
    dispatch({ type: 'SET_CONFIRMATION_MODAL', payload: { show: false } })
  }, [])

  const handleSubmit = useCallback(async () => {
    // Validate form
    const validationSchema = createValidationSchema(packageData)
    const { isValid, errorMap } = validatePayload(validationSchema, packageData)

    dispatch({
      type: 'SET_VALIDATION_ERRORS',
      payload: { errors: errorMap, hasError: !isValid },
    })

    if (!isValid) {
      console.error('Validation Error', errorMap)
      return
    }

    try {
      if (isEditing) {
        await updatePackage.mutateAsync({ _id: packageId, ...packageData })
        dispatch({
          type: 'SET_CONFIRMATION_MODAL',
          payload: {
            show: true,
            type: 'update',
            title: 'Success',
            subtitle: 'Package updated successfully!',
          },
        })
      } else {
        await createPackage.mutateAsync({ ...packageData, category: nameToPath(category) })
        dispatch({
          type: 'SET_CONFIRMATION_MODAL',
          payload: {
            show: true,
            type: 'create',
            title: 'Success',
            subtitle: 'New package created successfully!',
          },
        })
      }

      setTimeout(() => {
        dispatch({ type: 'SET_CONFIRMATION_MODAL', payload: { show: true } })
      }, 500)
    } catch (error) {
      console.error('Unable to create/update package', error)
      dispatch({
        type: 'SET_CONFIRMATION_MODAL',
        payload: {
          show: true,
          type: 'delete',
          title: 'Error',
          subtitle: `Unable to ${isEditing ? 'update' : 'create'} package. Please try again.`,
        },
      })
    }
  }, [packageData, isEditing, packageId, updatePackage, createPackage, category])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load package data when editing
  useEffect(() => {
    if (packageDataResponse) {
      const transformedPackage = transformPackageResponse(packageDataResponse, category)
      dispatch({ type: 'SET_PACKAGE', payload: transformedPackage })
      dispatch({
        type: 'SET_EDITING_MODE',
        payload: { isEditing: true, packageId: params.id || '' },
      })
    }
  }, [packageDataResponse, params.id, category])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const categoryDisplayName = useMemo(() => pathToName(category), [category])

  const breadcrumbData = useMemo(
    () => [
      { label: 'Home', route: '/dashboard' },
      { label: `${categoryDisplayName} Packages`, route: `/packages/${category}` },
      { label: `${isEditing ? 'Edit' : 'New'} ${categoryDisplayName} Package` },
    ],
    [categoryDisplayName, category, isEditing]
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          {`${isEditing ? 'Edit' : 'New'} ${categoryDisplayName} Package`}
        </Text>
        <Breadcrumb data={breadcrumbData} />
      </div>
      {isValidationError && (
        <Alert
          type="error"
          message="There is an error with submission, please correct errors indicated below."
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : getPackageError ? (
          <>
            <Alert
              type="error"
              message="Unable to get the Package data. Please try again later."
              className={bemClass([blk, 'margin-bottom'])}
            />
            <Button size="medium" clickHandler={navigateBack}>Go Back</Button>
          </>
        ) : (
          <>
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
                      handlePackageFieldChange('packageCode', value.packageCode?.toString() ?? '')
                    }}
                    required
                    errorMessage={validationErrors['packageCode']}
                    invalid={!!validationErrors['packageCode']}
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
                      handlePackageFieldChange('minimumKm', value.minimumKm ? Number(value.minimumKm) : '')
                    }}
                    required
                    errorMessage={validationErrors['minimumKm']}
                    invalid={!!validationErrors['minimumKm']}
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
                      handlePackageFieldChange('minimumHr', value.minimumHr ? Number(value.minimumHr) : '')
                    }}
                    required
                    errorMessage={validationErrors['minimumHr']}
                    invalid={!!validationErrors['minimumHr']}
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
                      handlePackageFieldChange('baseAmount', value.baseAmount ? Number(value.baseAmount) : '')
                    }}
                    required
                    errorMessage={validationErrors['baseAmount']}
                    invalid={!!validationErrors['baseAmount']}
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
                      handlePackageFieldChange('extraKmPerKmRate', value.extraKmPerKmRate ? Number(value.extraKmPerKmRate) : '')
                    }}
                    required
                    errorMessage={validationErrors['extraKmPerKmRate']}
                    invalid={!!validationErrors['extraKmPerKmRate']}
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
                      handlePackageFieldChange('extraHrPerHrRate', value.extraHrPerHrRate ? Number(value.extraHrPerHrRate) : '')
                    }}
                    required
                    errorMessage={validationErrors['extraHrPerHrRate']}
                    invalid={!!validationErrors['extraHrPerHrRate']}
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
                  handlePackageFieldChange('comment', value.comment?.toString() ?? '')
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
                      handlePackageFieldChange('isActive', !!obj.isActive)
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
                clickHandler={handleSubmit}
              >
                {isEditing ? 'Update' : 'Submit'}
              </Button>
            </div>
          </>
        )}
      </div>
      <Modal
        show={showConfirmationModal}
        closeHandler={closeConfirmationModal}
      >
        <ConfirmationPopup
          type={confirmationModal.type}
          title={confirmationModal.title}
          subTitle={confirmationModal.subtitle}
          confirmButtonText="Okay"
          confirmHandler={['create', 'update'].includes(confirmationModal.type) ? navigateBack : closeConfirmationModal}
        />
      </Modal>
    </div>
  )
}

export default CreatePackage
