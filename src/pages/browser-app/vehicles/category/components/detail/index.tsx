import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatBooleanValueForDisplay, formatDateValueForDisplay } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { vehicleDetailsFields } from './model'
import { VehicleModel, INITIAL_VEHICLE, Panel, Field } from '@types'
import PageDetail from '@base/page-detail'
import { useVehicleByIdQuery } from '@api/queries/vehicle'

const blk = 'vehicle-detail'

interface VehicleDetailProps {}

interface TransformedVehicleData extends Record<string, any> {
  type: string
  manufacturer: string
  name: string
  noOfSeats: string | number
  registrationNo: string
  hasAc: string
  isMonthlyFixed: string
  monthlyFixedDetails: {
    customerCategory: string
    customer: { name: string } | string
    packageCategory: string
    package: { packageCode: string } | string
    staffCategory: string
    staff: { name: string } | string
    contractStartDate: string
    contractEndDate: string
  } | null
  comments: string
  isActive: string
}

// Transform the vehicle data to handle object references and formatting
const transformVehicleData = (data: VehicleModel): TransformedVehicleData => {
  return {
    ...data,
    noOfSeats: data.noOfSeats?.toString() || '-',
    hasAc: formatBooleanValueForDisplay(data.hasAc),
    isMonthlyFixed: formatBooleanValueForDisplay(data.isMonthlyFixed),
    // Transform monthly fixed details to preserve object structure for nested paths
    monthlyFixedDetails: data.monthlyFixedDetails ? {
      customerCategory: data.monthlyFixedDetails.customerCategory || '-',
      customer: (() => {
        const customer = data.monthlyFixedDetails.customer
        if (!customer) return '-'
        // If it's already an object, return it as is for nested path access
        if (typeof customer === 'object' && 'name' in customer) {
          return customer
        }
        // If it's a string, create an object structure for consistency
        return { name: customer.toString() }
      })(),
      packageCategory: data.monthlyFixedDetails.packageCategory || '-',
      package: (() => {
        const pkg = data.monthlyFixedDetails.package
        if (!pkg) return '-'
        // If it's already an object, return it as is for nested path access
        if (typeof pkg === 'object' && 'packageCode' in pkg) {
          return pkg
        }
        // If it's a string, create an object structure for consistency
        return { packageCode: pkg.toString() }
      })(),
      staffCategory: data.monthlyFixedDetails.staffCategory || '-',
      staff: (() => {
        const staff = data.monthlyFixedDetails.staff
        if (!staff) return '-'
        // If it's already an object, return it as is for nested path access
        if (typeof staff === 'object' && 'name' in staff) {
          return staff
        }
        // If it's a string, create an object structure for consistency
        return { name: staff.toString() }
      })(),
      contractStartDate: formatDateValueForDisplay(data.monthlyFixedDetails.contractStartDate || null),
      contractEndDate: formatDateValueForDisplay(data.monthlyFixedDetails.contractEndDate || null),
    } : null,
    comments: data.comments || '-',
    isActive: formatBooleanValueForDisplay(data.isActive),
  }
}

// Create filtered template based on isMonthlyFixed
const createFilteredTemplate = (originalTemplate: Panel[], data: VehicleModel): Panel[] => {
  return originalTemplate.filter(panel => {
    // Completely remove monthly fixed panels if isMonthlyFixed is false
    if (panel.panel.includes('Monthly Fixed')) {
      return data.isMonthlyFixed
    }
    return true
  })
}

const VehicleDetail: FunctionComponent<VehicleDetailProps> = () => {
  const params = useParams()

  const { data: currentVehicleData, isLoading, error } = useVehicleByIdQuery(params.id || '')
  const [vehicleData, setVehicleData] = useState<TransformedVehicleData | null>(null)

  // Memoize the filtered template based on vehicle data
  const filteredTemplate = useMemo(() => {
    if (!currentVehicleData) {
      return vehicleDetailsFields
    }
    return createFilteredTemplate(vehicleDetailsFields, currentVehicleData)
  }, [currentVehicleData])

  useEffect(() => {
    if (currentVehicleData) {
      const transformedData = transformVehicleData(currentVehicleData)
      setVehicleData(transformedData)
    }
  }, [currentVehicleData])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Vehicle Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : error ? (
          <Alert
            type="error"
            message={'Unable to get the vehicle details, please try later'}
          />
        ) : (
          <PageDetail
            pageData={vehicleData || INITIAL_VEHICLE}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default VehicleDetail
