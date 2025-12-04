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
  packageDetails: {
    packageCategory: string
    package: {
      packageCode: string
    }
  }
  requestDetails: {
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
  }
  customerDetails: {
    customerType: string
    customerCategory: string | null
    customer: {
      name: string
    } | null
    newCustomerDetails: {
      name: string
      contact: string
      email: string
    } | null
  }
  vehicleDetails: {
    vehicleType: string
    vehicleCategory: string | null
    vehicle: {
      name: string
      registrationNo: string
    } | null
    supplierDetails: {
      supplier: {
        companyName: string
      } | null
      package: {
        packageCode: string
      } | null
    }
    newVehicleDetails: {
      ownerName: string
      ownerContact: string
      ownerEmail: string
      manufacturer: string
      name: string
      registrationNo: string
    } | null
  }
  staffDetails: {
    staffType: string
    staffCategory: string | null
    staff: {
      name: string
    } | null
    newStaffDetails: {
      name: string
      contact: string
      license: string
    } | null
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
  status: string
  paymentDetails: {
    amountPaid: string
    paymentMethod: string
    paymentDate: string
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
  supplierPackageData?: PackageModel
): TransformedRegularRequestData => {
  return {
    packageDetails: {
      packageCategory: data.packageDetails.packageCategory || '-',
      package: (() => {
        if (packageData) {
          return { packageCode: packageData.packageCode }
        }
        if (data.packageDetails.package && typeof data.packageDetails.package === 'object' && (data.packageDetails.package as any).packageCode) {
          return { packageCode: (data.packageDetails.package as any).packageCode }
        }
        return { packageCode: '-' }
      })(),
    },
    requestDetails: {
      requestType: data.requestDetails.requestType || '-',
      pickUpLocation: data.requestDetails.pickUpLocation || '-',
      dropOffLocation: data.requestDetails.dropOffLocation || '-',
      pickUpDateTime: formatDateValueForDisplay(data.requestDetails.pickUpDateTime),
      dropDateTime: formatDateValueForDisplay(data.requestDetails.dropDateTime),
      openingKm: data.requestDetails.openingKm?.toString() || '-',
      closingKm: data.requestDetails.closingKm?.toString() || '-',
      totalKm: data.requestDetails.totalKm ? `${data.requestDetails.totalKm} km` : '-',
      totalHr: data.requestDetails.totalHr ? `${Math.floor(data.requestDetails.totalHr / 60)}h ${Math.floor(data.requestDetails.totalHr % 60)}m` : '-',
      ac: formatBooleanValueForDisplay(data.requestDetails.ac),
    },
    customerDetails: {
      customerType: data.customerDetails.customerType || '-',
      customerCategory: data.customerDetails.customerCategory || null,
      customer: (() => {
        if (customerData) {
          return { name: customerData.name }
        }
        if (data.customerDetails.customer && typeof data.customerDetails.customer === 'object' && (data.customerDetails.customer as any).name) {
          return { name: (data.customerDetails.customer as any).name }
        }
        return null
      })(),
      newCustomerDetails: data.customerDetails.newCustomerDetails ? {
        name: data.customerDetails.newCustomerDetails.name || '-',
        contact: data.customerDetails.newCustomerDetails.contact || '-',
        email: data.customerDetails.newCustomerDetails.email || '-',
      } : null,
    },
    vehicleDetails: {
      vehicleType: data.vehicleDetails.vehicleType || '-',
      vehicleCategory: data.vehicleDetails.vehicleCategory || null,
      vehicle: (() => {
        if (vehicleData) {
          return { name: vehicleData.name, registrationNo: vehicleData.registrationNo }
        }
        if (data.vehicleDetails.vehicle && typeof data.vehicleDetails.vehicle === 'object') {
          const veh = data.vehicleDetails.vehicle as any
          return { name: veh.name || '-', registrationNo: veh.registrationNo || '-' }
        }
        return null
      })(),
      supplierDetails: {
        supplier: (() => {
          if (supplierData) {
            return { companyName: supplierData.companyName }
          }
          if (data.vehicleDetails.supplierDetails.supplier && typeof data.vehicleDetails.supplierDetails.supplier === 'object') {
            return { companyName: (data.vehicleDetails.supplierDetails.supplier as any).companyName || '-' }
          }
          return null
        })(),
        package: (() => {
          if (supplierPackageData) {
            return { packageCode: supplierPackageData.packageCode }
          }
          if (data.vehicleDetails.supplierDetails.package && typeof data.vehicleDetails.supplierDetails.package === 'object') {
            return { packageCode: (data.vehicleDetails.supplierDetails.package as any).packageCode || '-' }
          }
          return null
        })(),
      },
      newVehicleDetails: data.vehicleDetails.newVehicleDetails ? {
        ownerName: data.vehicleDetails.newVehicleDetails.ownerName || '-',
        ownerContact: data.vehicleDetails.newVehicleDetails.ownerContact || '-',
        ownerEmail: data.vehicleDetails.newVehicleDetails.ownerEmail || '-',
        manufacturer: data.vehicleDetails.newVehicleDetails.manufacturer || '-',
        name: data.vehicleDetails.newVehicleDetails.name || '-',
        registrationNo: data.vehicleDetails.newVehicleDetails.registrationNo || '-',
      } : null,
    },
    staffDetails: {
      staffType: data.staffDetails.staffType || '-',
      staffCategory: data.staffDetails.staffCategory || null,
      staff: (() => {
        if (staffData) {
          return { name: staffData.name }
        }
        if (data.staffDetails.staff && typeof data.staffDetails.staff === 'object') {
          return { name: (data.staffDetails.staff as any).name || '-' }
        }
        return null
      })(),
      newStaffDetails: data.staffDetails.newStaffDetails ? {
        name: data.staffDetails.newStaffDetails.name || '-',
        contact: data.staffDetails.newStaffDetails.contact || '-',
        license: data.staffDetails.newStaffDetails.license || '-',
      } : null,
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
    status: data.status || '-',
    paymentDetails: {
      amountPaid: data.paymentDetails.amountPaid?.toString() || '-',
      paymentMethod: data.paymentDetails.paymentMethod || '-',
      paymentDate: formatDateValueForDisplay(data.paymentDetails.paymentDate),
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
          if ((field.path === 'customerDetails.customer.name' || field.path === 'customerDetails.customerCategory') && 
              data.customerDetails.customerType === 'new') {
            return false
          }
          // Show newCustomerDetails fields only for new customers
          if (field.path.startsWith('customerDetails.newCustomerDetails.') && data.customerDetails.customerType === 'existing') {
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
          // Show supplier fields only for existing vehicles with supplier category
          if ((field.path.startsWith('vehicleDetails.supplierDetails.')) &&
              (data.vehicleDetails.vehicleType === 'new' || nameToPath(data.vehicleDetails.vehicleCategory || '') !== 'supplier')) {
            return false
          }
          // Show vehicle fields only for existing vehicles
          if ((field.path === 'vehicleDetails.vehicle.name' || field.path === 'vehicleDetails.vehicle.registrationNo' || field.path === 'vehicleDetails.vehicleCategory') && 
              data.vehicleDetails.vehicleType === 'new') {
            return false
          }
          // Show newVehicleDetails fields only for new vehicles
          if (field.path.startsWith('vehicleDetails.newVehicleDetails.') && data.vehicleDetails.vehicleType === 'existing') {
            return false
          }
          return true
        })
      }
    }

    // Filter Staff Details panel based on staffType
    if (panel.panel === 'Staff Details') {
      return {
        ...panel,
        fields: panel.fields.filter(field => {
          // Show staff fields only for existing staff
          if ((field.path === 'staffDetails.staff.name' || field.path === 'staffDetails.staffCategory') && 
              data.staffDetails.staffType === 'new') {
            return false
          }
          // Show newStaffDetails fields only for new staff
          if (field.path.startsWith('staffDetails.newStaffDetails.') && data.staffDetails.staffType === 'existing') {
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
  const customerId = currentRegularRequestData?.customerDetails.customer && typeof currentRegularRequestData.customerDetails.customer === 'string'
    ? currentRegularRequestData.customerDetails.customer
    : ''

  const supplierId = currentRegularRequestData?.vehicleDetails.supplierDetails.supplier && typeof currentRegularRequestData.vehicleDetails.supplierDetails.supplier === 'string'
    ? currentRegularRequestData.vehicleDetails.supplierDetails.supplier
    : ''

  const vehicleId = currentRegularRequestData?.vehicleDetails.vehicle && typeof currentRegularRequestData.vehicleDetails.vehicle === 'string'
    ? currentRegularRequestData.vehicleDetails.vehicle
    : ''

  const staffId = currentRegularRequestData?.staffDetails.staff && typeof currentRegularRequestData.staffDetails.staff === 'string'
    ? currentRegularRequestData.staffDetails.staff
    : ''

  const packageId = currentRegularRequestData?.packageDetails.package && typeof currentRegularRequestData.packageDetails.package === 'string'
    ? currentRegularRequestData.packageDetails.package
    : ''

  const supplierPackageId = currentRegularRequestData?.vehicleDetails.supplierDetails.package && typeof currentRegularRequestData.vehicleDetails.supplierDetails.package === 'string'
    ? currentRegularRequestData.vehicleDetails.supplierDetails.package
    : ''

  // Conditionally fetch related data
  const shouldFetchCustomer = currentRegularRequestData?.customerDetails.customerType === 'existing' && !!customerId
  const { data: customerData, isLoading: isCustomerLoading } = useCustomerByIdQuery(
    shouldFetchCustomer ? customerId : ''
  )

  const shouldFetchSupplier = currentRegularRequestData?.vehicleDetails.vehicleType === 'existing' &&
    currentRegularRequestData.vehicleDetails.vehicleCategory &&
    nameToPath(currentRegularRequestData.vehicleDetails.vehicleCategory) === 'supplier' && !!supplierId
  const { data: supplierData, isLoading: isSupplierLoading } = useSupplierByIdQuery(
    shouldFetchSupplier ? supplierId : ''
  )

  const shouldFetchVehicle = currentRegularRequestData?.vehicleDetails.vehicleType === 'existing' && !!vehicleId
  const { data: vehicleData, isLoading: isVehicleLoading } = useVehicleByIdQuery(
    shouldFetchVehicle ? vehicleId : ''
  )

  const shouldFetchStaff = currentRegularRequestData?.staffDetails.staffType === 'existing' && !!staffId
  const { data: staffData, isLoading: isStaffLoading } = useStaffByIdQuery(
    shouldFetchStaff ? staffId : ''
  )

  const shouldFetchPackage = !!packageId
  const { data: packageData, isLoading: isPackageLoading } = usePackageByIdQuery(
    shouldFetchPackage ? packageId : ''
  )

  const shouldFetchSupplierPackage = currentRegularRequestData?.vehicleDetails.vehicleType === 'existing' &&
    currentRegularRequestData.vehicleDetails.vehicleCategory &&
    nameToPath(currentRegularRequestData.vehicleDetails.vehicleCategory) === 'supplier' && !!supplierPackageId
  const { data: supplierPackageData, isLoading: isSupplierPackageLoading } = usePackageByIdQuery(
    shouldFetchSupplierPackage ? supplierPackageId : ''
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
        (shouldFetchSupplierPackage && isSupplierPackageLoading)

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
        supplierPackageData
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
          (shouldFetchSupplierPackage && isSupplierPackageLoading)) ? (
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
