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

export interface CustomerAddress {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pinCode: string
}

export interface CustomerModel {
  _id?: string
  name: string
  contact: string
  whatsAppNumber: string
  email?: string
  address: CustomerAddress
  isActive: boolean
  comment?: string
  category: string
}

// --------------------------------------------------------------------------------------------------------

export interface StaffAddress {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pinCode: string
}

export interface StaffModel {
  _id?: string
  name: string
  contact: string
  whatsAppNumber: string
  email?: string
  joiningDate: Date | null
  salary: number | string
  license?: string
  isActive: boolean
  comment?: string
  address: StaffAddress
  category: string
}

export const INITIAL_STAFF: StaffModel = {
  name: '',
  contact: '',
  whatsAppNumber: '',
  email: '',
  joiningDate: null,
  salary: '',
  license: '',
  isActive: true,
  comment: '',
  address: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
  },
  category: '',
} as const

// --------------------------------------------------------------------------------------------------------

export interface RegularRequestModel {
  customerType: 'existing' | 'new'
  vehicleType: 'existing' | 'new'
  staffType: 'existing' | 'new'
  requestType: string

  customerCategory: string | null
  customer: string | null
  customerDetails: null | {
    name: string
    contact: string
    email: string
  }
  vehicleCategory: string | null
  vehicle: string | null
  vehicleDetails: null | {
    ownerName: string
    ownerContact: string
    ownerEmail: string
    manufacturer: string
    name: string
    registrationNo: string
  }
  ac: boolean
  packageCategory: string | null
  package: string | null
  staffCategory: string | null
  staff: string | null
  staffDetails: null | {
    name: string
    contact: string
    license: string
  }
  pickUpLocation: string
  dropOffLocation: string
  pickUpDateTime: Date | null
  dropDateTime: Date | null
  openingKm: number | null
  closingKm: number | null
  totalKm: number | null
  totalHr: number | null

  paymentDetails: {
    status: '' | 'BILL_GENERATED' | 'BILL_SENT_TO_CUSTOMER' | 'PAYMENT_RECEIVED'
    paymentMethod: string
    paymentDate: Date | null
  }
  otherCharges: {
    toll: {
      amount: string | number
      isChargeableToCustomer: boolean
    }
    parking: {
      amount: string | number
      isChargeableToCustomer: boolean
    }
    nightHalt: {
      amount: string | number
      isChargeableToCustomer: boolean
      isPayableWithSalary: boolean
    }
    driverAllowance: {
      amount: string | number
      isChargeableToCustomer: boolean
      isPayableWithSalary: boolean
    }
  }
  advancedPayment: {
    advancedFromCustomer: string | number
    advancedToCustomer: string | number
  }
  comment: string
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
  customerType: string
  pickUpLocation: string
  dropOffLocation: string
  pickUpDateTime: Date | null
  noOfSeats: number | null
  hasAc: boolean
  vehicleType: string
  customerCategory: string | null
  customer: string | null
  customerDetails: {
    name: string
    contact: string
    email: string
  } | null
  comment: string
}
//
export interface AdvancePaymentModel {
  staffCategory: string
  staff: string
  paymentDate: Date | null
  paymentMethod: string
  amount: string | number
  comment: string
}
//
export interface PackageModel {
  category: string
  packageCode: string
  minimumKm: string | number
  minimumHr: string | number
  baseAmount: string | number
  extraKmPerKmRate: string | number
  extraHrPerHrRate: string | number
  comment?: string
  isActive: boolean
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
    | null
    | {
        customerCategory: string | null
        customer: string | null
        packageCategory: string | null
        package: string | null
        staffCategory: string | null
        staff: string | null
        contractStartDate: Date | null
        contractEndDate: Date | null
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
  type: string
  paymentMethod: string
  date: Date | null
  amount: string | number
  location: string
  vehicleCategory: string | null
  vehicle: string | null
  staffCategory: string | null
  staff: string | null
  comment: string
  category: string
}
