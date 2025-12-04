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
  assignmentDetails: {
    packageCategory: string
    package: {
      packageCode: string
    }
    vehicleCategory: string
    vehicle: {
      name: string
      registrationNo: string
    }
    staffCategory: string
    staff: {
      name: string
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
    customerCategory: string
    customer: {
      name: string
    }
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
  comment: string
}

// Transform the monthly fixed request data to handle object references and formatting
const transformMonthlyFixedRequestData = (
  data: MonthlyFixedRequestModel,
  assignmentPackageData?: PackageModel,
  assignmentVehicleData?: VehicleModel,
  assignmentStaffData?: StaffModel,
  customerData?: CustomerModel,
  vehicleData?: VehicleModel,
  supplierData?: SupplierModel,
  supplierPackageData?: PackageModel,
  staffData?: StaffModel
): TransformedMonthlyFixedRequestData => {
  return {
    assignmentDetails: {
      packageCategory: data.assignmentDetails.packageCategory || '-',
      package: (() => {
        if (assignmentPackageData) {
          return { packageCode: assignmentPackageData.packageCode }
        }
        if (data.assignmentDetails.package && typeof data.assignmentDetails.package === 'object') {
          return { packageCode: (data.assignmentDetails.package as any).packageCode || '-' }
        }
        return { packageCode: '-' }
      })(),
      vehicleCategory: data.assignmentDetails.vehicleCategory || '-',
      vehicle: (() => {
        if (assignmentVehicleData) {
          return { name: assignmentVehicleData.name, registrationNo: assignmentVehicleData.registrationNo }
        }
        if (data.assignmentDetails.vehicle && typeof data.assignmentDetails.vehicle === 'object') {
          const veh = data.assignmentDetails.vehicle as any
          return { name: veh.name || '-', registrationNo: veh.registrationNo || '-' }
        }
        return { name: '-', registrationNo: '-' }
      })(),
      staffCategory: data.assignmentDetails.staffCategory || '-',
      staff: (() => {
        if (assignmentStaffData) {
          return { name: assignmentStaffData.name }
        }
        if (data.assignmentDetails.staff && typeof data.assignmentDetails.staff === 'object') {
          return { name: (data.assignmentDetails.staff as any).name || '-' }
        }
        return { name: '-' }
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
      customerCategory: data.customerDetails.customerCategory || '-',
      customer: (() => {
        if (customerData) {
          return { name: customerData.name }
        }
        if (data.customerDetails.customer && typeof data.customerDetails.customer === 'object') {
          return { name: (data.customerDetails.customer as any).name || '-' }
        }
        return { name: '-' }
      })(),
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
          // Show supplier fields only for existing vehicles with supplier category
          if (field.path.startsWith('vehicleDetails.supplierDetails.') &&
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

interface MonthlyFixedRequestDetailProps {}

const MonthlyFixedRequestDetail: FunctionComponent<MonthlyFixedRequestDetailProps> = () => {
  const params = useParams()

  const { data: currentMonthlyFixedRequestData, isLoading, error } = useFixedRequestByIdQuery(params.id || '')

  // Get IDs from monthly fixed request data for fetching related data
  const assignmentPackageId = currentMonthlyFixedRequestData?.assignmentDetails.package && typeof currentMonthlyFixedRequestData.assignmentDetails.package === 'string'
    ? currentMonthlyFixedRequestData.assignmentDetails.package
    : ''

  const assignmentVehicleId = currentMonthlyFixedRequestData?.assignmentDetails.vehicle && typeof currentMonthlyFixedRequestData.assignmentDetails.vehicle === 'string'
    ? currentMonthlyFixedRequestData.assignmentDetails.vehicle
    : ''

  const assignmentStaffId = currentMonthlyFixedRequestData?.assignmentDetails.staff && typeof currentMonthlyFixedRequestData.assignmentDetails.staff === 'string'
    ? currentMonthlyFixedRequestData.assignmentDetails.staff
    : ''

  const customerId = currentMonthlyFixedRequestData?.customerDetails.customer && typeof currentMonthlyFixedRequestData.customerDetails.customer === 'string'
    ? currentMonthlyFixedRequestData.customerDetails.customer
    : ''

  const vehicleId = currentMonthlyFixedRequestData?.vehicleDetails.vehicle && typeof currentMonthlyFixedRequestData.vehicleDetails.vehicle === 'string'
    ? currentMonthlyFixedRequestData.vehicleDetails.vehicle
    : ''

  const supplierId = currentMonthlyFixedRequestData?.vehicleDetails.supplierDetails.supplier && typeof currentMonthlyFixedRequestData.vehicleDetails.supplierDetails.supplier === 'string'
    ? currentMonthlyFixedRequestData.vehicleDetails.supplierDetails.supplier
    : ''

  const supplierPackageId = currentMonthlyFixedRequestData?.vehicleDetails.supplierDetails.package && typeof currentMonthlyFixedRequestData.vehicleDetails.supplierDetails.package === 'string'
    ? currentMonthlyFixedRequestData.vehicleDetails.supplierDetails.package
    : ''

  const staffId = currentMonthlyFixedRequestData?.staffDetails.staff && typeof currentMonthlyFixedRequestData.staffDetails.staff === 'string'
    ? currentMonthlyFixedRequestData.staffDetails.staff
    : ''

  // Conditionally fetch related data - Assignment Details
  const shouldFetchAssignmentPackage = !!assignmentPackageId
  const { data: assignmentPackageData, isLoading: isAssignmentPackageLoading } = usePackageByIdQuery(
    shouldFetchAssignmentPackage ? assignmentPackageId : ''
  )

  const shouldFetchAssignmentVehicle = !!assignmentVehicleId
  const { data: assignmentVehicleData, isLoading: isAssignmentVehicleLoading } = useVehicleByIdQuery(
    shouldFetchAssignmentVehicle ? assignmentVehicleId : ''
  )

  const shouldFetchAssignmentStaff = !!assignmentStaffId
  const { data: assignmentStaffData, isLoading: isAssignmentStaffLoading } = useStaffByIdQuery(
    shouldFetchAssignmentStaff ? assignmentStaffId : ''
  )

  // Customer Details
  const shouldFetchCustomer = !!customerId
  const { data: customerData, isLoading: isCustomerLoading } = useCustomerByIdQuery(
    shouldFetchCustomer ? customerId : ''
  )

  const shouldFetchVehicle = currentMonthlyFixedRequestData?.vehicleDetails.vehicleType === 'existing' && !!vehicleId
  const { data: vehicleData, isLoading: isVehicleLoading } = useVehicleByIdQuery(
    shouldFetchVehicle ? vehicleId : ''
  )

  const shouldFetchSupplier = currentMonthlyFixedRequestData?.vehicleDetails.vehicleType === 'existing' &&
    currentMonthlyFixedRequestData.vehicleDetails.vehicleCategory &&
    nameToPath(currentMonthlyFixedRequestData.vehicleDetails.vehicleCategory) === 'supplier' && !!supplierId
  const { data: supplierData, isLoading: isSupplierLoading } = useSupplierByIdQuery(
    shouldFetchSupplier ? supplierId : ''
  )

  const shouldFetchSupplierPackage = currentMonthlyFixedRequestData?.vehicleDetails.vehicleType === 'existing' &&
    currentMonthlyFixedRequestData.vehicleDetails.vehicleCategory &&
    nameToPath(currentMonthlyFixedRequestData.vehicleDetails.vehicleCategory) === 'supplier' && !!supplierPackageId
  const { data: supplierPackageData, isLoading: isSupplierPackageLoading } = usePackageByIdQuery(
    shouldFetchSupplierPackage ? supplierPackageId : ''
  )

  const shouldFetchStaff = currentMonthlyFixedRequestData?.staffDetails.staffType === 'existing' && !!staffId
  const { data: staffData, isLoading: isStaffLoading } = useStaffByIdQuery(
    shouldFetchStaff ? staffId : ''
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
        (shouldFetchAssignmentPackage && isAssignmentPackageLoading) ||
        (shouldFetchAssignmentVehicle && isAssignmentVehicleLoading) ||
        (shouldFetchAssignmentStaff && isAssignmentStaffLoading) ||
        (shouldFetchCustomer && isCustomerLoading) ||
        (shouldFetchVehicle && isVehicleLoading) ||
        (shouldFetchSupplier && isSupplierLoading) ||
        (shouldFetchSupplierPackage && isSupplierPackageLoading) ||
        (shouldFetchStaff && isStaffLoading)

      if (isAnyRelatedDataLoading) {
        return
      }

      const transformedData = transformMonthlyFixedRequestData(
        currentMonthlyFixedRequestData,
        assignmentPackageData,
        assignmentVehicleData,
        assignmentStaffData,
        customerData,
        vehicleData,
        supplierData,
        supplierPackageData,
        staffData
      )
      setMonthlyFixedRequestData(transformedData)
    }
  }, [
    currentMonthlyFixedRequestData,
    assignmentPackageData,
    assignmentVehicleData,
    assignmentStaffData,
    customerData,
    vehicleData,
    supplierData,
    supplierPackageData,
    staffData,
    shouldFetchAssignmentPackage,
    isAssignmentPackageLoading,
    shouldFetchAssignmentVehicle,
    isAssignmentVehicleLoading,
    shouldFetchAssignmentStaff,
    isAssignmentStaffLoading,
    shouldFetchCustomer,
    isCustomerLoading,
    shouldFetchVehicle,
    isVehicleLoading,
    shouldFetchSupplier,
    isSupplierLoading,
    shouldFetchSupplierPackage,
    isSupplierPackageLoading,
    shouldFetchStaff,
    isStaffLoading,
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
          (shouldFetchAssignmentPackage && isAssignmentPackageLoading) ||
          (shouldFetchAssignmentVehicle && isAssignmentVehicleLoading) ||
          (shouldFetchAssignmentStaff && isAssignmentStaffLoading) ||
          (shouldFetchCustomer && isCustomerLoading) ||
          (shouldFetchVehicle && isVehicleLoading) ||
          (shouldFetchSupplier && isSupplierLoading) ||
          (shouldFetchSupplierPackage && isSupplierPackageLoading) ||
          (shouldFetchStaff && isStaffLoading)) ? (
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