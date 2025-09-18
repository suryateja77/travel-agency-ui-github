import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatBooleanValueForDisplay, formatDateValueForDisplay, nameToPath } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { regularRequestDetailsFields } from './model'
import { RegularRequestModel, SupplierModel, CustomerModel, VehicleModel, StaffModel, PackageModel, Panel, Field } from '@types'
import PageDetail from '@base/page-detail'
import { useRegularRequestByIdQuery } from '@api/queries/regular-request'
import { useSupplierByIdQuery } from '@api/queries/supplier'
import { useCustomerByIdQuery } from '@api/queries/customer'
import { useVehicleByIdQuery } from '@api/queries/vehicle'
import { useStaffByIdQuery } from '@api/queries/staff'
import { usePackageByIdQuery } from '@api/queries/package'

const blk = 'regular-request-detail'

interface TransformedRegularRequestData extends Record<string, any> {
  customerType: string
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
  customerCategory: string | null
  customer: {
    name: string
  }
  customerDetails: {
    name: string
    contact: string
    email: string
  } | null
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
  packageFromProvidedVehicle: {
    packageCategory: string
    package: {
      packageCode: string
    }
  } | undefined
  packageCategory: string | null
  package: {
    packageCode: string
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
  paymentDetails: {
    status: string
    paymentMethod: string
    paymentDate: string
  }
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
  }
  advancedPayment: {
    advancedFromCustomer: string
    advancedToSupplier: string
  }
  requestTotal: string
  requestExpense: string
  requestProfit: string
  customerBill: string
  comment: string
}

// Transform the regular request data to handle object references and formatting
const transformRegularRequestData = (
  data: RegularRequestModel,
  supplierData?: SupplierModel,
  customerData?: CustomerModel,
  vehicleData?: VehicleModel,
  staffData?: StaffModel,
  packageData?: PackageModel,
  supplierPackageData?: PackageModel,
  providerPackageData?: PackageModel
): TransformedRegularRequestData => {
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
    package: (() => {
      if (packageData) {
        return { packageCode: packageData.packageCode }
      }
      // Fallback: extract packageCode from embedded package object in main response
      if (data.package && typeof data.package === 'object' && (data.package as any).packageCode) {
        return { packageCode: (data.package as any).packageCode }
      }
      return { packageCode: '-' }
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
        if (data.packageFromProvidedVehicle.package && typeof data.packageFromProvidedVehicle.package === 'object' && (data.packageFromProvidedVehicle.package as any).packageCode) {
          return { packageCode: (data.packageFromProvidedVehicle.package as any).packageCode }
        }
        return { packageCode: '-' }
      })(),
    } : undefined,
    paymentDetails: {
      status: data.paymentDetails.status || '-',
      paymentMethod: data.paymentDetails.paymentMethod || '-',
      paymentDate: formatDateValueForDisplay(data.paymentDetails.paymentDate),
    },
    otherCharges: {
      toll: {
        amount: data.otherCharges.toll.amount?.toString() || '-',
        isChargeableToCustomer: formatBooleanValueForDisplay(data.otherCharges.toll.isChargeableToCustomer),
      },
      parking: {
        amount: data.otherCharges.parking.amount?.toString() || '-',
        isChargeableToCustomer: formatBooleanValueForDisplay(data.otherCharges.parking.isChargeableToCustomer),
      },
      nightHalt: {
        amount: data.otherCharges.nightHalt.amount?.toString() || '-',
        isChargeableToCustomer: formatBooleanValueForDisplay(data.otherCharges.nightHalt.isChargeableToCustomer),
        isPayableWithSalary: formatBooleanValueForDisplay(data.otherCharges.nightHalt.isPayableWithSalary),
      },
      driverAllowance: {
        amount: data.otherCharges.driverAllowance.amount?.toString() || '-',
        isChargeableToCustomer: formatBooleanValueForDisplay(data.otherCharges.driverAllowance.isChargeableToCustomer),
        isPayableWithSalary: formatBooleanValueForDisplay(data.otherCharges.driverAllowance.isPayableWithSalary),
      },
    },
    advancedPayment: {
      advancedFromCustomer: data.advancedPayment.advancedFromCustomer?.toString() || '-',
      advancedToSupplier: data.advancedPayment.advancedToSupplier?.toString() || '-',
    },
    requestTotal: `₹${data.requestTotal.toLocaleString()}`,
    requestExpense: `₹${data.requestExpense.toLocaleString()}`,
    requestProfit: `₹${data.requestProfit.toLocaleString()}`,
    customerBill: `₹${data.customerBill.toLocaleString()}`,
    comment: data.comment || '-',
  }
}

// Create filtered template based on conditional fields
const createFilteredTemplate = (originalTemplate: Panel[], data: RegularRequestModel): Panel[] => {
  return originalTemplate.map(panel => {
    // Filter Customer Details panel based on customerType
    if (panel.panel === 'Customer Details') {
      return {
        ...panel,
        fields: panel.fields.filter(field => {
          // Show customer fields only for existing customers
          if (field.path.startsWith('customer.') && data.customerType === 'new') {
            return false
          }
          // Show customerDetails fields only for new customers
          if (field.path.startsWith('customerDetails.') && data.customerType === 'existing') {
            return false
          }
          return true
        })
      }
    }

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

    // Filter Advanced Payment panel
    if (panel.panel === 'Advanced Payment') {
      return {
        ...panel,
        fields: panel.fields.filter(field => {
          // Show advancedToSupplier only for supplier vehicles
          if (field.path === 'advancedPayment.advancedToSupplier' &&
              (data.vehicleType === 'new' || nameToPath(data.vehicleCategory || '') !== 'supplier')) {
            return false
          }
          return true
        })
      }
    }

    return panel
  }).filter(Boolean) as Panel[]
}

const RegularRequestDetail: FunctionComponent = () => {
  const params = useParams()

  const { data: currentRegularRequestData, isLoading, error } = useRegularRequestByIdQuery(params.id || '')

  // Get IDs from regular request data for fetching related data
  const customerId = currentRegularRequestData?.customer && typeof currentRegularRequestData.customer === 'string'
    ? currentRegularRequestData.customer
    : ''

  const supplierId = currentRegularRequestData?.supplier && typeof currentRegularRequestData.supplier === 'string'
    ? currentRegularRequestData.supplier
    : ''

  const vehicleId = currentRegularRequestData?.vehicle && typeof currentRegularRequestData.vehicle === 'string'
    ? currentRegularRequestData.vehicle
    : ''

  const staffId = currentRegularRequestData?.staff && typeof currentRegularRequestData.staff === 'string'
    ? currentRegularRequestData.staff
    : ''

  const packageId = currentRegularRequestData?.package && typeof currentRegularRequestData.package === 'string'
    ? currentRegularRequestData.package
    : ''

  const supplierPackageId = currentRegularRequestData?.supplierPackage && typeof currentRegularRequestData.supplierPackage === 'string'
    ? currentRegularRequestData.supplierPackage
    : ''

  const providerPackageId = currentRegularRequestData?.packageFromProvidedVehicle?.package && typeof currentRegularRequestData.packageFromProvidedVehicle.package === 'string'
    ? currentRegularRequestData.packageFromProvidedVehicle.package
    : ''

  // Conditionally fetch related data
  const shouldFetchCustomer = currentRegularRequestData?.customerType === 'existing' && !!customerId
  const { data: customerData, isLoading: isCustomerLoading } = useCustomerByIdQuery(
    shouldFetchCustomer ? customerId : ''
  )

  const shouldFetchSupplier = currentRegularRequestData?.vehicleType === 'existing' &&
    currentRegularRequestData.vehicleCategory &&
    nameToPath(currentRegularRequestData.vehicleCategory) === 'supplier' && !!supplierId
  const { data: supplierData, isLoading: isSupplierLoading } = useSupplierByIdQuery(
    shouldFetchSupplier ? supplierId : ''
  )

  const shouldFetchVehicle = currentRegularRequestData?.vehicleType === 'existing' && !!vehicleId
  const { data: vehicleData, isLoading: isVehicleLoading } = useVehicleByIdQuery(
    shouldFetchVehicle ? vehicleId : ''
  )

  const shouldFetchStaff = currentRegularRequestData?.staffType === 'existing' && !!staffId
  const { data: staffData, isLoading: isStaffLoading } = useStaffByIdQuery(
    shouldFetchStaff ? staffId : ''
  )

  const shouldFetchPackage = !!packageId
  const { data: packageData, isLoading: isPackageLoading } = usePackageByIdQuery(
    shouldFetchPackage ? packageId : ''
  )

  const shouldFetchSupplierPackage = currentRegularRequestData?.vehicleType === 'existing' &&
    currentRegularRequestData.vehicleCategory &&
    nameToPath(currentRegularRequestData.vehicleCategory) === 'supplier' && !!supplierPackageId
  const { data: supplierPackageData, isLoading: isSupplierPackageLoading } = usePackageByIdQuery(
    shouldFetchSupplierPackage ? supplierPackageId : ''
  )

  const shouldFetchProviderPackage = currentRegularRequestData?.vehicleType === 'new' && !!providerPackageId
  const { data: providerPackageData, isLoading: isProviderPackageLoading } = usePackageByIdQuery(
    shouldFetchProviderPackage ? providerPackageId : ''
  )

  const [regularRequestData, setRegularRequestData] = useState<TransformedRegularRequestData | null>(null)

  // Memoize the filtered template based on regular request data
  const filteredTemplate = useMemo(() => {
    if (!currentRegularRequestData) {
      return regularRequestDetailsFields
    }
    return createFilteredTemplate(regularRequestDetailsFields, currentRegularRequestData)
  }, [currentRegularRequestData])

  useEffect(() => {
    if (currentRegularRequestData) {
      // If we need related data but it's still loading, wait for it
      const isAnyRelatedDataLoading =
        (shouldFetchCustomer && isCustomerLoading) ||
        (shouldFetchSupplier && isSupplierLoading) ||
        (shouldFetchVehicle && isVehicleLoading) ||
        (shouldFetchStaff && isStaffLoading) ||
        (shouldFetchPackage && isPackageLoading) ||
        (shouldFetchSupplierPackage && isSupplierPackageLoading) ||
        (shouldFetchProviderPackage && isProviderPackageLoading)

      if (isAnyRelatedDataLoading) {
        return
      }

      const transformedData = transformRegularRequestData(
        currentRegularRequestData,
        supplierData,
        customerData,
        vehicleData,
        staffData,
        packageData,
        supplierPackageData,
        providerPackageData
      )
      setRegularRequestData(transformedData)
    }
  }, [
    currentRegularRequestData,
    supplierData,
    customerData,
    vehicleData,
    staffData,
    packageData,
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
    shouldFetchPackage,
    isPackageLoading,
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
          Regular Request Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {(isLoading ||
          (shouldFetchCustomer && isCustomerLoading) ||
          (shouldFetchSupplier && isSupplierLoading) ||
          (shouldFetchVehicle && isVehicleLoading) ||
          (shouldFetchStaff && isStaffLoading) ||
          (shouldFetchPackage && isPackageLoading) ||
          (shouldFetchSupplierPackage && isSupplierPackageLoading) ||
          (shouldFetchProviderPackage && isProviderPackageLoading)) ? (
          <Loader type="form" />
        ) : (error) ? (
          <Alert
            type="error"
            message="Unable to get the regular request details, please try later"
          />
        ) : (
          <PageDetail
            pageData={regularRequestData || {}}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default RegularRequestDetail