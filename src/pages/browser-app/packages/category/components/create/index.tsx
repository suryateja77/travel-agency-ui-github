import React, { FunctionComponent, useEffect, useState, useMemo, useCallback } from 'react'
import { Panel, Row, Column, TextInput, NumberInput, Button, TextArea, Alert, Toggle, Breadcrumb, Text, SelectInput } from '@base'
import { PackageModel } from '@types'
import { bemClass, pathToName, nameToPath, validatePayload } from '@utils'
import { useToast } from '@contexts/ToastContext'

import './style.scss'
import { useNavigate, useParams } from 'react-router-dom'
import { createValidationSchema } from './validation'
import { useCreatePackageMutation, usePackageByIdQuery, useUpdatePackageMutation } from '@api/queries/package'
import { useSuppliersQuery } from '@api/queries/supplier'
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

interface SelectOption {
  key: string
  value: string
}

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
// UTILITY FUNCTIONS
// ============================================================================

const transformPackageResponse = (response: PackageResponseModel, category: string): PackageModel => ({
  category: response.category || nameToPath(category),
  supplier: response.supplier || '',
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
  const { showToast } = useToast()

  const [packageData, setPackageData] = useState<PackageModel>({
    ...INITIAL_PACKAGE,
    category: nameToPath(category),
  })
  const [isEditing, setIsEditing] = useState(false)
  const [packageId, setPackageId] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isValidationError, setIsValidationError] = useState(false)
  const [supplierOptions, setSupplierOptions] = useState<SelectOption[]>([])
  const [apiErrors, setApiErrors] = useState<{ suppliers: string }>({ suppliers: '' })
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false)

  // API Hooks
  const createPackage = useCreatePackageMutation()
  const updatePackage = useUpdatePackageMutation()
  const { data: packageDataResponse, isLoading, error: getPackageError } = usePackageByIdQuery(params.id || '')
  const suppliersQuery = useSuppliersQuery()

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePackageFieldChange = useCallback(
    <K extends keyof PackageModel>(field: K, value: PackageModel[K]) => {
      setPackageData(prev => ({ ...prev, [field]: value }))
    },
    []
  )

  const validateField = useCallback(
    (field: keyof PackageModel, nextData: PackageModel) => {
      const validationSchema = createValidationSchema(nextData, category)
      const { errorMap } = validatePayload(validationSchema, nextData)
      
      // Only update the error for the specific field being validated
      setValidationErrors(prev => {
        const updated = { ...prev }
        if (errorMap[field]) {
          updated[field] = errorMap[field]
        } else {
          delete updated[field]
        }
        return updated
      })
      
      // Clear validation error banner if no errors remain (but never set it during field validation)
      const hasErrors = Object.keys({ ...validationErrors, [field]: errorMap[field] })
        .filter(key => key !== field)
        .some(key => validationErrors[key])
      
      if (!hasErrors && !errorMap[field]) {
        setIsValidationError(false)
      }
    },
    [category, validationErrors]
  )

  const handleSupplierChange = useCallback(
    (value: { supplier?: string }) => {
      const supplierValue = value.supplier?.toString() || ''
      if (['Please wait...', 'Unable to load options', 'No suppliers found'].includes(supplierValue)) return

      const selectedOption = supplierOptions.find(option => option.value === supplierValue)
      setPackageData(prev => ({
        ...prev,
        supplier: selectedOption?.key || '',
      }))
    },
    [supplierOptions]
  )

  const navigateBack = useCallback(() => {
    navigate(`/packages/${category}`)
  }, [navigate, category])

  const handleSubmit = useCallback(async () => {
    try {
      // Set loading state
      setSubmitButtonLoading(true)

      const validationSchema = createValidationSchema(packageData, category)
      const { isValid, errorMap } = validatePayload(validationSchema, packageData)

      setValidationErrors(errorMap)
      setIsValidationError(!isValid)

      if (!isValid) {
        console.error('Validation Error', errorMap)
        setSubmitButtonLoading(false)
        return
      }

      const supplierValue = category === 'supplier' ? (packageData.supplier || null) : null
      const payload = {
        ...packageData,
        supplier: supplierValue,
        category: nameToPath(category),
      }

      if (isEditing) {
        await updatePackage.mutateAsync({ _id: packageId, ...payload })
        showToast('Package updated successfully!', 'success')
      } else {
        await createPackage.mutateAsync(payload)
        showToast('New package created successfully!', 'success')
      }

      // Clear loading state before navigation
      setSubmitButtonLoading(false)
      navigateBack()
    } catch (error) {
      console.error('Unable to create/update package', error)
      showToast(`Unable to ${isEditing ? 'update' : 'create'} package. Please try again.`, 'error')
      setSubmitButtonLoading(false)
    }
  }, [packageData, isEditing, packageId, updatePackage, createPackage, category, showToast, navigateBack])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load package data when editing
  useEffect(() => {
    if (packageDataResponse) {
      const transformedPackage = transformPackageResponse(packageDataResponse, category)
      setPackageData(transformedPackage)
      setIsEditing(true)
      setPackageId(params.id || '')
      setValidationErrors({})
      setIsValidationError(false)
    }
  }, [packageDataResponse, params.id, category])

  // Handle suppliers data
  useEffect(() => {
    if (category !== 'supplier') {
      setSupplierOptions([])
      setApiErrors(prev => ({ ...prev, suppliers: '' }))
      return
    }

    if (suppliersQuery.isError) {
      const errorMessage = 'Unable to load supplier data. Please check your connection and try again.'
      setApiErrors(prev => ({ ...prev, suppliers: errorMessage }))
      setSupplierOptions([])
      showToast(errorMessage, 'error')
      return
    }

    if (suppliersQuery.data?.data?.length) {
      const options = suppliersQuery.data.data.map((supplier: any) => ({
        key: supplier._id,
        value: supplier.companyName,
      }))
      setSupplierOptions(options)
      setApiErrors(prev => ({ ...prev, suppliers: '' }))
    } else {
      setSupplierOptions([])
      setApiErrors(prev => ({ ...prev, suppliers: '' }))
    }
  }, [category, suppliersQuery.data, suppliersQuery.isError, showToast])

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

  const supplierSelectOptions = useMemo(
    () =>
      suppliersQuery.isLoading
        ? [{ key: 'loading', value: 'Please wait...' }]
        : suppliersQuery.isError
        ? [{ key: 'error', value: 'Unable to load options' }]
        : supplierOptions.length > 0
        ? supplierOptions
        : [{ key: 'no-data', value: 'No suppliers found' }],
    [suppliersQuery.isLoading, suppliersQuery.isError, supplierOptions]
  )

  const selectedSupplierValue = useMemo(() => {
    const supplierId = packageData.supplier
    if (!supplierId || !supplierOptions.length) return ''
    const option = supplierOptions.find(opt => opt.key === supplierId)
    return option?.value || ''
  }, [packageData.supplier, supplierOptions])

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
      {apiErrors.suppliers && (
        <Alert
          type="error"
          message={apiErrors.suppliers}
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
              {category === 'supplier' && (
                <Row>
                  <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                    <SelectInput
                      label="Supplier"
                      name="supplier"
                      options={supplierSelectOptions}
                      value={selectedSupplierValue}
                      changeHandler={handleSupplierChange}
                      onBlur={() => validateField('supplier', packageData)}
                      required={category === 'supplier'}
                      errorMessage={validationErrors.supplier}
                      invalid={!!validationErrors.supplier}
                      disabled={suppliersQuery.isLoading || suppliersQuery.isError}
                    />
                  </Column>
                </Row>
              )}
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
                    onBlur={() => validateField('packageCode', packageData)}
                    required
                    errorMessage={validationErrors['packageCode']}
                    invalid={!!validationErrors['packageCode']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <NumberInput
                    label="Minimum Km"
                    name="minimumKm"
                    value={packageData.minimumKm ?? ''}
                    changeHandler={value => {
                      handlePackageFieldChange('minimumKm', value.minimumKm ?? '')
                    }}
                    onBlur={() => validateField('minimumKm', packageData)}
                    min={0.01}
                    required
                    errorMessage={validationErrors['minimumKm']}
                    invalid={!!validationErrors['minimumKm']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <NumberInput
                    label="Minimum Hours"
                    name="minimumHr"
                    value={packageData.minimumHr ?? ''}
                    changeHandler={value => {
                      handlePackageFieldChange('minimumHr', value.minimumHr ?? '')
                    }}
                    onBlur={() => validateField('minimumHr', packageData)}
                    min={0.01}
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
                  <NumberInput
                    label="Base Amount"
                    name="baseAmount"
                    value={packageData.baseAmount ?? ''}
                    changeHandler={value => {
                      handlePackageFieldChange('baseAmount', value.baseAmount ?? '')
                    }}
                    onBlur={() => validateField('baseAmount', packageData)}
                    min={0.01}
                    required
                    errorMessage={validationErrors['baseAmount']}
                    invalid={!!validationErrors['baseAmount']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <NumberInput
                    label="Extra Km Per Km Rate"
                    name="extraKmPerKmRate"
                    value={packageData.extraKmPerKmRate ?? ''}
                    changeHandler={value => {
                      handlePackageFieldChange('extraKmPerKmRate', value.extraKmPerKmRate ?? '')
                    }}
                    onBlur={() => validateField('extraKmPerKmRate', packageData)}
                    min={0.01}
                    required
                    errorMessage={validationErrors['extraKmPerKmRate']}
                    invalid={!!validationErrors['extraKmPerKmRate']}
                  />
                </Column>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <NumberInput
                    label="Extra Hr Per Hr Rate"
                    name="extraHrPerHrRate"
                    value={packageData.extraHrPerHrRate ?? ''}
                    changeHandler={value => {
                      handlePackageFieldChange('extraHrPerHrRate', value.extraHrPerHrRate ?? '')
                    }}
                    onBlur={() => validateField('extraHrPerHrRate', packageData)}
                    min={0.01}
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
                disabled={submitButtonLoading}
              >
                Cancel
              </Button>
              <Button
                size="medium"
                category="primary"
                clickHandler={handleSubmit}
                loading={submitButtonLoading}
              >
                {isEditing ? 'Update' : 'Submit'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CreatePackage
