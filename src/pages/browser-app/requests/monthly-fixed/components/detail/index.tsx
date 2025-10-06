import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatBooleanValueForDisplay, formatDateValueForDisplay, nameToPath } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { monthlyFixedRequestDetailsFields } from './model'
import { MonthlyFixedRequestModel, SupplierModel, CustomerModel, VehicleModel, StaffModel, PackageModel, Panel, Field } from '@types'
import PageDetail from '@base/page-detail'
import { useFixedRequestByIdQuery } from '@api/queries/fixed-request'
import { useSupplierByIdQuery } from '@api/queries/supplier'
import { useCustomerByIdQuery } from '@api/queries/customer'
import { useVehicleByIdQuery } from '@api/queries/vehicle'
import { useStaffByIdQuery } from '@api/queries/staff'
import { usePackageByIdQuery } from '@api/queries/package'

const blk = 'monthly-fixed-request-detail'

interface TransformedMonthlyFixedRequestData extends Record<string, any> {
  vehicleType: string
  staffType: string
  requestType: string
  pickUpLocation: string
  dropOffLocation: string
  pickUpDateTime: string
  dropDateTime: string
  openingKm: string
  closingKm: string
  totalKm: string
  totalHr: string
  ac: string
  customerCategory: string
  customer: {
    name: string
  }
  vehicleCategory: string | null
  supplier: {
    companyName: string
  }
  supplierPackage: {
    packageCode: string
  }
  vehicle: {
    name: string
  }
  vehicleDetails: {
    ownerName: string
    ownerContact: string
    ownerEmail: string
    manufacturer: string
    name: string
    registrationNo: string
  } | null
  packageFromProvidedVehicle:
    | undefined
    | {
        packageCategory: string
        package: {
          packageCode: string
        }
      }
  staffCategory: string | null
  staff: {
    name: string
  }
  staffDetails: {
    name: string
    contact: string
    license: string
  } | null
  otherCharges: {
    toll: {
      amount: string
      isChargeableToCustomer: string
    }
    parking: {
      amount: string
      isChargeableToCustomer: string
    }
    nightHalt: {
      amount: string
      isChargeableToCustomer: string
      isPayableWithSalary: string
    }
    driverAllowance: {
      amount: string
      isChargeableToCustomer: string
      isPayableWithSalary: string
    }
  } | null
  advancePayment: {
    advancedFromCustomer: string
    advancedToDriver: string
  } | null
  comment: string
}

// Transform the monthly fixed request data to handle object references and formatting
const transformMonthlyFixedRequestData = (
  data: MonthlyFixedRequestModel,
  supplierData?: SupplierModel,
  customerData?: CustomerModel,
  vehicleData?: VehicleModel,
  staffData?: StaffModel,
  supplierPackageData?: PackageModel,
  providerPackageData?: PackageModel
): TransformedMonthlyFixedRequestData => {
  return {
    ...data,
    pickUpDateTime: formatDateValueForDisplay(data.pickUpDateTime),
    dropDateTime: formatDateValueForDisplay(data.dropDateTime),
    openingKm: data.openingKm?.toString() || '-',
    closingKm: data.closingKm?.toString() || '-',
    totalKm: data.totalKm ? `${data.totalKm} km` : '-',
    totalHr: data.totalHr ? `${Math.floor(data.totalHr / 60)}h ${Math.floor(data.totalHr % 60)}m` : '-',
    ac: formatBooleanValueForDisplay(data.ac),
    customer: (() => {
      if (customerData) {
        return { name: customerData.name }
      }
      // Fallback: extract name from embedded customer object in main response
      if (data.customer && typeof data.customer === 'object' && (data.customer as any).name) {
        return { name: (data.customer as any).name }
      }
      return { name: '-' }
    })(),
    supplier: (() => {
      if (supplierData) {
        return { companyName: supplierData.companyName }
      }
      // Fallback: extract companyName from embedded supplier object in main response
      if (data.supplier && typeof data.supplier === 'object' && (data.supplier as any).companyName) {
        return { companyName: (data.supplier as any).companyName }
      }
      return { companyName: '-' }
    })(),
    supplierPackage: (() => {
      if (supplierPackageData) {
        return { packageCode: supplierPackageData.packageCode }
      }
      // Fallback: extract packageCode from embedded supplierPackage object in main response
      if (data.supplierPackage && typeof data.supplierPackage === 'object' && (data.supplierPackage as any).packageCode) {
        return { packageCode: (data.supplierPackage as any).packageCode }
      }
      return { packageCode: '-' }
    })(),
    vehicle: (() => {
      if (vehicleData) {
        return { name: vehicleData.name }
      }
      // Fallback: extract name from embedded vehicle object in main response
      if (data.vehicle && typeof data.vehicle === 'object' && (data.vehicle as any).name) {
        return { name: (data.vehicle as any).name }
      }
      return { name: '-' }
    })(),
    staff: (() => {
      if (staffData) {
        return { name: staffData.name }
      }
      // Fallback: extract name from embedded staff object in main response
      if (data.staff && typeof data.staff === 'object' && (data.staff as any).name) {
        return { name: (data.staff as any).name }
      }
      return { name: '-' }
    })(),
    packageFromProvidedVehicle: data.packageFromProvidedVehicle ? {
      packageCategory: data.packageFromProvidedVehicle.packageCategory,
      package: (() => {
        if (providerPackageData) {
          return { packageCode: providerPackageData.packageCode }
        }
        // Fallback: extract packageCode from embedded package in packageFromProvidedVehicle
        if (data.packageFromProvidedVehicle.packageId && typeof data.packageFromProvidedVehicle.packageId === 'object' && (data.packageFromProvidedVehicle.packageId as any).packageCode) {
          return { packageCode: (data.packageFromProvidedVehicle.packageId as any).packageCode }
        }
        return { packageCode: '-' }
      })(),
    } : undefined,
    otherCharges: {
      toll: {
        amount: data.otherCharges?.toll?.amount?.toString() || '-',
        isChargeableToCustomer: data.otherCharges?.toll ? formatBooleanValueForDisplay(data.otherCharges.toll.isChargeableToCustomer) : '-',
      },
      parking: {
        amount: data.otherCharges?.parking?.amount?.toString() || '-',
        isChargeableToCustomer: data.otherCharges?.parking ? formatBooleanValueForDisplay(data.otherCharges.parking.isChargeableToCustomer) : '-',
      },
      nightHalt: {
        amount: data.otherCharges?.nightHalt?.amount?.toString() || '-',
        isChargeableToCustomer: data.otherCharges?.nightHalt ? formatBooleanValueForDisplay(data.otherCharges.nightHalt.isChargeableToCustomer) : '-',
        isPayableWithSalary: data.otherCharges?.nightHalt ? formatBooleanValueForDisplay(data.otherCharges.nightHalt.isPayableWithSalary) : '-',
      },
      driverAllowance: {
        amount: data.otherCharges?.driverAllowance?.amount?.toString() || '-',
        isChargeableToCustomer: data.otherCharges?.driverAllowance ? formatBooleanValueForDisplay(data.otherCharges.driverAllowance.isChargeableToCustomer) : '-',
        isPayableWithSalary: data.otherCharges?.driverAllowance ? formatBooleanValueForDisplay(data.otherCharges.driverAllowance.isPayableWithSalary) : '-',
      },
    },
    advancePayment: {
      advancedFromCustomer: data.advancePayment?.advancedFromCustomer?.toString() || '-',
      advancedToDriver: data.advancePayment?.advancedToDriver?.toString() || '-',
    },
    comment: data.comment || '-',
  }
}

// Create filtered template based on conditional fields
const createFilteredTemplate = (originalTemplate: Panel[], data: MonthlyFixedRequestModel): Panel[] => {
  return originalTemplate.map(panel => {
    // Filter Vehicle Details panel based on vehicleType and category
    if (panel.panel === 'Vehicle Details') {
      return {
        ...panel,
        fields: panel.fields.filter(field => {
          // Show supplier/supplierPackage fields only for existing vehicles with supplier category
          if ((field.path === 'supplier.companyName' || field.path === 'supplierPackage.packageCode') &&
              (data.vehicleType === 'new' || nameToPath(data.vehicleCategory || '') !== 'supplier')) {
            return false
          }
          // Show vehicle field only for existing vehicles
          if (field.path === 'vehicle.name' && data.vehicleType === 'new') {
            return false
          }
          // Show vehicleDetails fields only for new vehicles
          if (field.path.startsWith('vehicleDetails.') && data.vehicleType === 'existing') {
            return false
          }
          return true
        })
      }
    }

    // Show Provider Package Details panel only for new vehicles
    if (panel.panel === 'Provider Package Details') {
      return data.vehicleType === 'new' ? panel : null
    }

    // Filter Staff Details panel based on staffType
    if (panel.panel === 'Staff Details') {
      return {
        ...panel,
        fields: panel.fields.filter(field => {
          // Show staff fields only for existing staff
          if (field.path.startsWith('staff.') && data.staffType === 'new') {
            return false
          }
          // Show staffDetails fields only for new staff
          if (field.path.startsWith('staffDetails.') && data.staffType === 'existing') {
            return false
          }
          return true
        })
      }
    }

    return panel
  }).filter(Boolean) as Panel[]
}

interface MonthlyFixedRequestDetailProps {}

const MonthlyFixedRequestDetail: FunctionComponent<MonthlyFixedRequestDetailProps> = () => {
  const params = useParams()

  const { data: currentMonthlyFixedRequestData, isLoading, error } = useFixedRequestByIdQuery(params.id || '')

  // Get IDs from monthly fixed request data for fetching related data
  const customerId = currentMonthlyFixedRequestData?.customer && typeof currentMonthlyFixedRequestData.customer === 'string'
    ? currentMonthlyFixedRequestData.customer
    : ''

  const supplierId = currentMonthlyFixedRequestData?.supplier && typeof currentMonthlyFixedRequestData.supplier === 'string'
    ? currentMonthlyFixedRequestData.supplier
    : ''

  const vehicleId = currentMonthlyFixedRequestData?.vehicle && typeof currentMonthlyFixedRequestData.vehicle === 'string'
    ? currentMonthlyFixedRequestData.vehicle
    : ''

  const staffId = currentMonthlyFixedRequestData?.staff && typeof currentMonthlyFixedRequestData.staff === 'string'
    ? currentMonthlyFixedRequestData.staff
    : ''

  const supplierPackageId = currentMonthlyFixedRequestData?.supplierPackage && typeof currentMonthlyFixedRequestData.supplierPackage === 'string'
    ? currentMonthlyFixedRequestData.supplierPackage
    : ''

  const providerPackageId = currentMonthlyFixedRequestData?.packageFromProvidedVehicle?.packageId && typeof currentMonthlyFixedRequestData.packageFromProvidedVehicle.packageId === 'string'
    ? currentMonthlyFixedRequestData.packageFromProvidedVehicle.packageId
    : ''

  // Conditionally fetch related data
  const shouldFetchCustomer = !!customerId
  const { data: customerData, isLoading: isCustomerLoading } = useCustomerByIdQuery(
    shouldFetchCustomer ? customerId : ''
  )

  const shouldFetchSupplier = currentMonthlyFixedRequestData?.vehicleType === 'existing' &&
    currentMonthlyFixedRequestData.vehicleCategory &&
    nameToPath(currentMonthlyFixedRequestData.vehicleCategory) === 'supplier' && !!supplierId
  const { data: supplierData, isLoading: isSupplierLoading } = useSupplierByIdQuery(
    shouldFetchSupplier ? supplierId : ''
  )

  const shouldFetchVehicle = currentMonthlyFixedRequestData?.vehicleType === 'existing' && !!vehicleId
  const { data: vehicleData, isLoading: isVehicleLoading } = useVehicleByIdQuery(
    shouldFetchVehicle ? vehicleId : ''
  )

  const shouldFetchStaff = currentMonthlyFixedRequestData?.staffType === 'existing' && !!staffId
  const { data: staffData, isLoading: isStaffLoading } = useStaffByIdQuery(
    shouldFetchStaff ? staffId : ''
  )

  const shouldFetchSupplierPackage = currentMonthlyFixedRequestData?.vehicleType === 'existing' &&
    currentMonthlyFixedRequestData.vehicleCategory &&
    nameToPath(currentMonthlyFixedRequestData.vehicleCategory) === 'supplier' && !!supplierPackageId
  const { data: supplierPackageData, isLoading: isSupplierPackageLoading } = usePackageByIdQuery(
    shouldFetchSupplierPackage ? supplierPackageId : ''
  )

  const shouldFetchProviderPackage = currentMonthlyFixedRequestData?.vehicleType === 'new' && !!providerPackageId
  const { data: providerPackageData, isLoading: isProviderPackageLoading } = usePackageByIdQuery(
    shouldFetchProviderPackage ? providerPackageId : ''
  )

  const [monthlyFixedRequestData, setMonthlyFixedRequestData] = useState<TransformedMonthlyFixedRequestData | null>(null)

  // Memoize the filtered template based on monthly fixed request data
  const filteredTemplate = useMemo(() => {
    if (!currentMonthlyFixedRequestData) {
      return monthlyFixedRequestDetailsFields
    }
    return createFilteredTemplate(monthlyFixedRequestDetailsFields, currentMonthlyFixedRequestData)
  }, [currentMonthlyFixedRequestData])

  useEffect(() => {
    if (currentMonthlyFixedRequestData) {
      // If we need related data but it's still loading, wait for it
      const isAnyRelatedDataLoading =
        (shouldFetchCustomer && isCustomerLoading) ||
        (shouldFetchSupplier && isSupplierLoading) ||
        (shouldFetchVehicle && isVehicleLoading) ||
        (shouldFetchStaff && isStaffLoading) ||
        (shouldFetchSupplierPackage && isSupplierPackageLoading) ||
        (shouldFetchProviderPackage && isProviderPackageLoading)

      if (isAnyRelatedDataLoading) {
        return
      }

      const transformedData = transformMonthlyFixedRequestData(
        currentMonthlyFixedRequestData,
        supplierData,
        customerData,
        vehicleData,
        staffData,
        supplierPackageData,
        providerPackageData
      )
      setMonthlyFixedRequestData(transformedData)
    }
  }, [
    currentMonthlyFixedRequestData,
    supplierData,
    customerData,
    vehicleData,
    staffData,
    supplierPackageData,
    providerPackageData,
    shouldFetchCustomer,
    isCustomerLoading,
    shouldFetchSupplier,
    isSupplierLoading,
    shouldFetchVehicle,
    isVehicleLoading,
    shouldFetchStaff,
    isStaffLoading,
    shouldFetchSupplierPackage,
    isSupplierPackageLoading,
    shouldFetchProviderPackage,
    isProviderPackageLoading,
  ])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Monthly Fixed Request Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {(isLoading ||
          (shouldFetchCustomer && isCustomerLoading) ||
          (shouldFetchSupplier && isSupplierLoading) ||
          (shouldFetchVehicle && isVehicleLoading) ||
          (shouldFetchStaff && isStaffLoading) ||
          (shouldFetchSupplierPackage && isSupplierPackageLoading) ||
          (shouldFetchProviderPackage && isProviderPackageLoading)) ? (
          <Loader type="form" />
        ) : (error) ? (
          <Alert
            type="error"
            message="Unable to get the monthly fixed request details, please try later"
          />
        ) : (
          <PageDetail
            pageData={monthlyFixedRequestData || {}}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default MonthlyFixedRequestDetail