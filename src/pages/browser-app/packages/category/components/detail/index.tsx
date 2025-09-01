import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatBooleanValueForDisplay } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { packageDetailsFields } from './model'
import { PackageModel, INITIAL_PACKAGE, Panel, Field } from '@types'
import PageDetail from '@base/page-detail'
import { usePackageByIdQuery } from '@api/queries/package'

const blk = 'package-detail'

interface PackageDetailProps {}

interface TransformedPackageData extends Record<string, any> {
  packageCode: string
  minimumKm: string | number
  minimumHr: string | number
  baseAmount: string | number
  extraKmPerKmRate: string | number
  extraHrPerHrRate: string | number
  comment: string
  isActive: string
}

// Transform the package data to handle formatting
const transformPackageData = (data: PackageModel): TransformedPackageData => {
  return {
    ...data,
    minimumKm: data.minimumKm?.toString() || '-',
    minimumHr: data.minimumHr?.toString() || '-',
    baseAmount: data.baseAmount?.toString() || '-',
    extraKmPerKmRate: data.extraKmPerKmRate?.toString() || '-',
    extraHrPerHrRate: data.extraHrPerHrRate?.toString() || '-',
    comment: data.comment || '-',
    isActive: formatBooleanValueForDisplay(data.isActive),
  }
}

// Create filtered template - packages don't have conditional logic like advance booking
const createFilteredTemplate = (originalTemplate: Panel[], data: PackageModel): Panel[] => {
  return originalTemplate // No filtering needed for packages
}

const PackageDetail: FunctionComponent<PackageDetailProps> = () => {
  const params = useParams()

  const { data: currentPackageData, isLoading, error } = usePackageByIdQuery(params.id || '')
  const [packageData, setPackageData] = useState<TransformedPackageData | null>(null)

  // Memoize the filtered template
  const filteredTemplate = useMemo(() => {
    if (!currentPackageData) {
      return packageDetailsFields
    }
    return createFilteredTemplate(packageDetailsFields, currentPackageData)
  }, [currentPackageData])

  useEffect(() => {
    if (currentPackageData) {
      const transformedData = transformPackageData(currentPackageData)
      setPackageData(transformedData)
    }
  }, [currentPackageData])

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
        {isLoading ? (
          <Loader type="form" />
        ) : error ? (
          <Alert
            type="error"
            message={'Unable to get the package details, please try later'}
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
