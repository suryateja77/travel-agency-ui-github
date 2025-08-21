export interface Field {
  label: string
  path: string
}

export interface ConfigurationItem {
  name: string
  comment: string
  id: number
}

export interface Configuration {
  name: string
  configurationItems: Array<ConfigurationItem>
  _id: string
}

export interface Panel {
  panel: string
  fields: Field[]
  type?: 'SINGLE' | 'MULTIPLE'
  parentPath?: string // Used for MULTIPLE type to indicate the parent path for array fields
}
export interface Address {
  addressLine1: string
  addressLine2: string
  landmark: string
  city: string
  country: string
  state: string
  pinCode: string
}

const sampleAddress: Address = {
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  country: '',
  state: '',
  pinCode: '',
}

export interface PointOfContact {
  name: string
  designation: string
  email: string
  contact: string
}

const samplePointOfContact: PointOfContact = {
  name: '',
  designation: '',
  email: '',
  contact: '',
}

export interface BankingDetailsType {
  type: string
  accountNumber: string
  accountName: string
  ifscCode: string
  mirCode: string
}

export const sampleBankingDetails: BankingDetailsType = {
  accountName: '',
  accountNumber: '',
  ifscCode: '',
  mirCode: '',
  type: '',
}

export const enum DetailFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  ARRAY = 'array',
}

// --------------------------------------------------------------------------------------------------------

export interface RegularRequestModel {
  requestDetails: {
    customerSelection: string
    vehicleSelection: string
    staffSelection: string
    requestType: string
    pickupLocation: string
    dropLocation: string
    pickupDateAndTime: Date | null
    dropDateAndTime: Date | null
    openingKm: number | null
    closingKm: number | null
    totalTime: number | null
    totalDistance: number | null
  }
  customerDetails:
    | {
        // For EXISTING customer
        customerId: string
        customerCategory: string
        customerName?: never
        customerEmail?: never
        customerContact?: never
      }
    | {
        // For NEW customer
        customerId?: never
        customerCategory?: never
        customerName: string
        customerEmail: string
        customerContact: string
      }
  vehicleDetails:
    | {
        // For EXISTING vehicle
        vehicleId: string
        vehicleCategory?: string
        ownerName?: never
        ownerContact?: never
        ownerEmail?: never
        vehicleManufacturer?: never
        vehicleName?: never
        vehicleRegistrationNumber?: never
      }
    | {
        // For NEW vehicle
        vehicleId?: never
        vehicleCategory?: never
        ownerName: string
        ownerContact: string
        ownerEmail: string
        vehicleManufacturer: string
        vehicleName: string
        vehicleRegistrationNumber: string
      }
  staffDetails:
    | {
        // For EXISTING staff
        staffId: string
        staffCategory?: string
        staffName?: never
        staffEmail?: never
        staffLicense?: never
      }
    | {
        // For NEW staff
        staffId?: never
        staffCategory?: never
        staffName: string
        staffEmail: string
        staffLicense: string
      }
  customerPackageDetails: {
    packageCategory: string
    packageId: string
  }
  otherCharges: {
    toll: {
      charge: number
      chargeableToCustomer: boolean
    }
    parking: {
      charge: number
      chargeableToCustomer: boolean
    }
    nightHalt: {
      charge: number
      chargeableToCustomer: boolean
      includeInDriverSalary: boolean
    }
    driverAllowance: {
      charge: number
      chargeableToCustomer: boolean
      includeInDriverSalary: boolean
    }
  }
  advancePayment: {
    advanceFromCustomer: number
    advanceToDriver: number
  }
  paymentDetails: {
    status: string
    paymentMode: string
    paymentDate: Date | null
  }
  comments: string
}
//
export interface MonthlyFixedRequestModel {
  customerDetails: {
    customerCategory: string
    customerId: string
  }
  requestDetails: {
    vehicleSelection: string
    staffSelection: string
    requestType: string
    pickupLocation: string
    dropLocation: string
    pickupDateAndTime: Date | null
    dropDateAndTime: Date | null
    openingKm: number | null
    closingKm: number | null
  }
  packageFromProvidedVehicle:
    | undefined
    | {
        packageCategory: string
        packageId: string
      }
  otherCharges: {
    toll: {
      charge: number
      chargeableToCustomer: boolean
    }
    parking: {
      charge: number
      chargeableToCustomer: boolean
    }
    nightHalt: {
      charge: number
      chargeableToCustomer: boolean
      includeInDriverSalary: boolean
    }
    driverAllowance: {
      charge: number
      chargeableToCustomer: boolean
      includeInDriverSalary: boolean
    }
  }
  advancePayment: {
    advanceFromCustomer: number
    advanceToDriver: number
  }
  comments: string
}
//
export interface AdvanceBookingModel {
  bookingDetails: {
    customerSelection: string
    pickupLocation: string
    dropLocation: string
    pickupDateAndTime: Date | null
    numberOfSeats: number | null
    airConditioning: boolean
    vehicleType: string
  }
  customerDetails:
    | {
        // For EXISTING customer
        customerId: string
        customerCategory: string
        customerName?: never
        customerEmail?: never
        customerContact?: never
      }
    | {
        // For NEW customer
        customerId?: never
        customerCategory?: never
        customerName: string
        customerEmail: string
        customerContact: string
      }
  comments: string
}
//
export interface AdvancePaymentModel {
  staffDetails: {
    staffCategory: string
    staffId: string
  }
  paymentDetails: {
    expenseDate: Date | null
    paymentMode: string
    amount: number
  }
  comments: string
}
//
export interface PackageModel {
  packageDetails: {
    packageCode: string
    minimumKm: number
    minimumHours: number
    basicAmount: number
    extraKmRate: number
    extraHoursRate: number
    comments: string
  }
  statusDetails: {
    isActive: boolean
  }
}
//
export interface VehicleModel {
  type: string
  manufacturer: string
  name: string
  noOfSeats: string | number
  registrationNo: string
  hasAc: boolean
  isMonthlyFixed: boolean
  monthlyFixedDetails:
    | undefined
    | {
        customerCategory: string
        customer: string
        packageCategory: string
        package: string
        staffCategory: string
        staff: string
        contractStartDate: Date
        contractEndDate: Date
      }
  category: string
  isActive: boolean
  comments: string
}
//
export interface StaffModel {
  name: string
  contact: string
  whatsAppNumber: string
  email?: string
  joiningDate: Date | null
  salary: string | number
  license?: string
  isActive: boolean
  comment?: string
  address: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pinCode: string
  }
  category: string
}
//
export interface ExpenseModel {
  expenseDetails: {
    expenseType: string
    paymentMode: string
    expenseDate: Date | null
    expenseAmount: number
    location: string
  }
  vehicleDetails:
    | undefined
    | {
        category: string
        vehicle: string
      }
  staffDetails:
    | undefined
    | {
        category: string
        staff: string
      }
  comments: string
}
