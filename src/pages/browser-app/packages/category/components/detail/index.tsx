import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatBooleanValueForDisplay } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { packageDetailsFields } from './model'
import { PackageModel, SupplierModel, INITIAL_PACKAGE, Panel, Field } from '@types'
import PageDetail from '@base/page-detail'
import { usePackageByIdQuery } from '@api/queries/package'
import { useSupplierByIdQuery } from '@api/queries/supplier'

const blk = 'package-detail'

interface PackageDetailProps {
  category?: string
}

interface TransformedPackageData extends Record<string, any> {
  supplier: {
    companyName: string
  }
  packageCode: string
  minimumKm: string | number
  minimumHr: string | number
  baseAmount: string | number
  extraKmPerKmRate: string | number
  extraHrPerHrRate: string | number
  comment: string
  isActive: string
}

// Transform the package data to handle object references and formatting
const transformPackageData = (data: PackageModel, supplierData?: SupplierModel): TransformedPackageData => {
  return {
    ...data,
    minimumKm: data.minimumKm?.toString() || '-',
    minimumHr: data.minimumHr?.toString() || '-',
    baseAmount: data.baseAmount?.toString() || '-',
    extraKmPerKmRate: data.extraKmPerKmRate?.toString() || '-',
    extraHrPerHrRate: data.extraHrPerHrRate?.toString() || '-',
    supplier: (() => {
      if (supplierData) {
        return { companyName: supplierData.companyName }
      }
      // Fallback display
      return { companyName: data.supplier || '-' }
    })(),
    comment: data.comment || '-',
    isActive: formatBooleanValueForDisplay(data.isActive),
  }
}

// Create filtered template based on category
const createFilteredTemplate = (originalTemplate: Panel[], data: PackageModel, category: string): Panel[] => {
  return originalTemplate
    .map(panel => {
      // For Package details panel, conditionally include supplier field
      if (panel.panel === 'Package details') {
        return {
          ...panel,
          fields: panel.fields.filter(field => {
            // Only include supplier field if category is 'supplier'
            if (field.path === 'supplier.companyName') {
              return category === 'supplier'
            }
            return true
          }),
        }
      }
      return panel
    })
    .filter(Boolean) as Panel[]
}

const PackageDetail: FunctionComponent<PackageDetailProps> = ({ category = '' }) => {
  const params = useParams()

  const [supplierId, setSupplierId] = useState<string>('')
  const { data: currentPackageData, isLoading, error } = usePackageByIdQuery(params.id || '')

  const { data: supplierData, isLoading: isSupplierLoading, error: supplierError } = useSupplierByIdQuery(supplierId)

  const [packageData, setPackageData] = useState<TransformedPackageData | null>(null)

  // Memoize the filtered template based on package data
  const filteredTemplate = useMemo(() => {
    if (!currentPackageData) {
      return packageDetailsFields
    }
    if (category === 'supplier') {
      console.log('Setting supplier ID for fetching supplier data:', currentPackageData.supplier)
      setSupplierId(currentPackageData.supplier || '')
    }
    return createFilteredTemplate(packageDetailsFields, currentPackageData, category)
  }, [currentPackageData, category])

  useEffect(() => {
    if (currentPackageData) {
      // If we need supplier data but it's still loading, wait for it
      if (category === 'supplier' && supplierId && isSupplierLoading) {
        return
      }

      const transformedData = transformPackageData(currentPackageData, supplierData || undefined)
      setPackageData(transformedData)
    }
  }, [currentPackageData, supplierData, category, supplierId, isSupplierLoading])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Package Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading || (category === 'supplier' && supplierId && isSupplierLoading) ? (
          <Loader type="form" />
        ) : error || (category === 'supplier' && supplierId && supplierError) ? (
          <Alert
            type="error"
            message={error ? 'Unable to get the package details, please try later' : 'Unable to get the supplier details, please try later'}
          />
        ) : (
          <PageDetail
            pageData={packageData || INITIAL_PACKAGE}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default PackageDetail
