import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatBooleanValueForDisplay, formatDateValueForDisplay } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { vehicleDetailsFields } from './model'
import { VehicleModel, SupplierModel, INITIAL_VEHICLE, Panel, Field } from '@types'
import PageDetail from '@base/page-detail'
import { useVehicleByIdQuery } from '@api/queries/vehicle'
import { useSupplierByIdQuery } from '@api/queries/supplier'

const blk = 'vehicle-detail'

interface VehicleDetailProps {
  category?: string
}

interface TransformedVehicleData extends Record<string, any> {
  type: string
  manufacturer: string
  name: string
  noOfSeats: string | number
  registrationNo: string
  hasAc: string
  supplier: {
    companyName: string
  }
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
const transformVehicleData = (data: VehicleModel, supplierData?: SupplierModel): TransformedVehicleData => {
  return {
    ...data,
    noOfSeats: data.noOfSeats?.toString() || '-',
    hasAc: formatBooleanValueForDisplay(data.hasAc),
    supplier: (() => {
      if (supplierData) {
        return { companyName: supplierData.companyName }
      }
      // Fallback display
      return { companyName: data.supplier || '-' }
    })(),
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
    comments: data.comment || '-',
    isActive: formatBooleanValueForDisplay(data.isActive),
  }
}

// Create filtered template based on isMonthlyFixed and category
const createFilteredTemplate = (originalTemplate: Panel[], data: VehicleModel, category: string): Panel[] => {
  return originalTemplate.map(panel => {
    // For Vehicle Details panel, conditionally include supplier field
    if (panel.panel === 'Vehicle Details') {
      return {
        ...panel,
        fields: panel.fields.filter(field => {
          // Only include supplier field if category is 'supplier'
          if (field.path === 'supplier.companyName') {
            return category === 'supplier'
          }
          return true
        })
      }
    }
    // Completely remove monthly fixed panels if isMonthlyFixed is false
    if (panel.panel.includes('Monthly Fixed')) {
      return data.isMonthlyFixed ? panel : null
    }
    return panel
  }).filter(Boolean) as Panel[]
}

const VehicleDetail: FunctionComponent<VehicleDetailProps> = ({ category = '' }) => {
  const params = useParams()

  const { data: currentVehicleData, isLoading, error } = useVehicleByIdQuery(params.id || '')
  
  // Get supplier ID from vehicle data
  const supplierId = currentVehicleData?.supplier && typeof currentVehicleData.supplier === 'string' 
    ? currentVehicleData.supplier 
    : ''
  
  // Conditionally fetch supplier data only if category is 'supplier' and we have a supplier ID
  const shouldFetchSupplier = category === 'supplier' && !!supplierId
  const { data: supplierData, isLoading: isSupplierLoading, error: supplierError } = useSupplierByIdQuery(
    shouldFetchSupplier ? supplierId : ''
  )
  
  const [vehicleData, setVehicleData] = useState<TransformedVehicleData | null>(null)

  // Memoize the filtered template based on vehicle data
  const filteredTemplate = useMemo(() => {
    if (!currentVehicleData) {
      return vehicleDetailsFields
    }
    return createFilteredTemplate(vehicleDetailsFields, currentVehicleData, category)
  }, [currentVehicleData, category])

  useEffect(() => {
    if (currentVehicleData) {
      // If we need supplier data but it's still loading, wait for it
      if (category === 'supplier' && supplierId && isSupplierLoading) {
        return
      }
      
      const transformedData = transformVehicleData(currentVehicleData, supplierData || undefined)
      setVehicleData(transformedData)
    }
  }, [currentVehicleData, supplierData, category, supplierId, isSupplierLoading])

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
        {(isLoading || (category === 'supplier' && supplierId && isSupplierLoading)) ? (
          <Loader type="form" />
        ) : (error || (category === 'supplier' && supplierId && supplierError)) ? (
          <Alert
            type="error"
            message={error ? 'Unable to get the vehicle details, please try later' : 'Unable to get the supplier details, please try later'}
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
