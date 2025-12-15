export interface Field {
  label: string
  path: string
}

export interface ConfigurationItem {
  name: string
  comment: string
  id: number
  disabled?: boolean
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
  city: string
  state: string
  pinCode: string
}

const sampleAddress: Address = {
  addressLine1: '',
  addressLine2: '',
  city: '',
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
  monthlyFixedDetails?: null | {
    staffCategory: string
    staff: string
    vehicleCategory: string
    vehicle: string
    package: string
  }
  category: string
}

export const INITIAL_CUSTOMER: CustomerModel = {
  name: '',
  contact: '',
  whatsAppNumber: '',
  email: '',
  address: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
  },
  isActive: true,
  monthlyFixedDetails: null,
  comment: '',
  category: '',
} as const

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

// New nested schema structure matching backend model
export interface RegularRequestModel {
  _id?: string
  consumerId?: string
  requestNo?: number
  
  packageDetails: {
    packageCategory: string
    package: string | { _id: string; packageCode?: string; [key: string]: any }
  }
  
  requestDetails: {
    requestType: string
    pickUpLocation: string
    dropOffLocation: string
    pickUpDateTime: Date | string | null
    dropDateTime: Date | string | null
    openingKm: number | null
    closingKm: number | null
    totalKm: number | null
    totalHr: number | null
    ac: boolean
  }
  
  customerDetails: {
    customerType: 'existing' | 'new'
    customerCategory: string | null
    customer: string | { _id: string; name?: string; [key: string]: any } | null
    newCustomerDetails: {
      name: string
      contact: string
      email: string
    } | null
  }
  
  vehicleDetails: {
    vehicleType: 'existing' | 'new'
    vehicleCategory: string | null
    vehicle: string | { _id: string; name?: string; registrationNo?: string; [key: string]: any } | null
    supplierDetails: {
      supplier: string | { _id: string; name?: string; [key: string]: any } | null
      package: string | { _id: string; packageCode?: string; [key: string]: any } | null
    }
    newVehicleDetails: {
      ownerName: string
      ownerContact: string
      ownerEmail: string
      manufacturer: string
      name: string
      registrationNo: string
      package?: string | { _id: string; packageCode?: string; [key: string]: any } | null
    } | null
  }
  
  staffDetails: {
    staffType: 'existing' | 'new'
    staffCategory: string | null
    staff: string | { _id: string; name?: string; [key: string]: any } | null
    newStaffDetails: {
      name: string
      contact: string
      license: string
    } | null
  }
  
  otherCharges: {
    toll: {
      amount: number
      isChargeableToCustomer: boolean
    }
    parking: {
      amount: number
      isChargeableToCustomer: boolean
    }
    nightHalt: {
      amount: number
      isChargeableToCustomer: boolean
      isPayableWithSalary: boolean
    }
    driverAllowance: {
      amount: number
      isChargeableToCustomer: boolean
      isPayableWithSalary: boolean
    }
  }
  
  status: 'ONGOING' | 'PAYMENT_PENDING' | 'CLOSED'
  
  paymentDetails: {
    amountPaid: number
    paymentMethod: string | null
    paymentDate: Date | string | null
  }
  
  requestTotal: number
  requestExpense: number
  requestProfit: number
  customerBill: number
  comment: string
  createdAt?: Date | string
}

export const INITIAL_REGULAR_REQUEST: RegularRequestModel = {
  packageDetails: {
    packageCategory: '',
    package: '',
  },
  requestDetails: {
    requestType: '',
    pickUpLocation: '',
    dropOffLocation: '',
    pickUpDateTime: null,
    dropDateTime: null,
    openingKm: null,
    closingKm: null,
    totalKm: null,
    totalHr: null,
    ac: true,
  },
  customerDetails: {
    customerType: 'existing',
    customerCategory: null,
    customer: null,
    newCustomerDetails: null,
  },
  vehicleDetails: {
    vehicleType: 'existing',
    vehicleCategory: null,
    vehicle: null,
    supplierDetails: {
      supplier: null,
      package: null,
    },
    newVehicleDetails: null,
  },
  staffDetails: {
    staffType: 'existing',
    staffCategory: null,
    staff: null,
    newStaffDetails: null,
  },
  otherCharges: {
    toll: {
      amount: 0,
      isChargeableToCustomer: false,
    },
    parking: {
      amount: 0,
      isChargeableToCustomer: false,
    },
    nightHalt: {
      amount: 0,
      isChargeableToCustomer: false,
      isPayableWithSalary: false,
    },
    driverAllowance: {
      amount: 0,
      isChargeableToCustomer: false,
      isPayableWithSalary: false,
    },
  },
  status: 'ONGOING',
  paymentDetails: {
    amountPaid: 0,
    paymentMethod: null,
    paymentDate: null,
  },
  requestTotal: 0,
  requestExpense: 0,
  requestProfit: 0,
  customerBill: 0,
  comment: '',
} as const
// New nested schema structure matching backend FixedRequest model
export interface MonthlyFixedRequestModel {
  _id?: string
  consumerId?: string
  requestNo?: number
  
  customerDetails: {
    customerCategory: string
    customer: string | { _id: string; name?: string; [key: string]: any }
  }
  
  requestDetails: {
    requestType: string
    ac: boolean
    pickUpLocation: string
    dropOffLocation: string
    pickUpDateTime: Date | string | null
    dropDateTime: Date | string | null
    openingKm: number | null
    closingKm: number | null
    totalKm: number | null
    totalHr: number | null
  }
  
  assignmentDetails: {
    packageCategory: string
    package: string | { _id: string; packageCode?: string; [key: string]: any }
    vehicleCategory: string
    vehicle: string | { _id: string; name?: string; registrationNo?: string; [key: string]: any }
    staffCategory: string
    staff: string | { _id: string; name?: string; [key: string]: any }
  }
  
  vehicleDetails: {
    vehicleType: 'regular' | 'existing' | 'new'
    vehicleCategory: string | null
    vehicle: string | { _id: string; name?: string; registrationNo?: string; [key: string]: any } | null
    supplierDetails: {
      supplier: string | { _id: string; companyName?: string; [key: string]: any } | null
      package: string | { _id: string; packageCode?: string; [key: string]: any } | null
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
    staffType: 'regular' | 'existing' | 'new'
    staffCategory: string | null
    staff: string | { _id: string; name?: string; [key: string]: any } | null
    newStaffDetails: {
      name: string
      contact: string
      license: string
    } | null
  }
  
  otherCharges: {
    toll: {
      amount: number
      isChargeableToCustomer: boolean
    }
    parking: {
      amount: number
      isChargeableToCustomer: boolean
    }
    nightHalt: {
      amount: number
      isChargeableToCustomer: boolean
      isPayableWithSalary: boolean
    }
    driverAllowance: {
      amount: number
      isChargeableToCustomer: boolean
      isPayableWithSalary: boolean
    }
  }
  
  paymentDetails: {
    advanceAmountPaid: number
  }
  
  supplierExpense: number
  comment: string
  createdAt?: Date | string
}

export const INITIAL_MONTHLY_FIXED_REQUEST: MonthlyFixedRequestModel = {
  customerDetails: {
    customerCategory: '',
    customer: '',
  },
  requestDetails: {
    requestType: '',
    ac: true,
    pickUpLocation: '',
    dropOffLocation: '',
    pickUpDateTime: null,
    dropDateTime: null,
    openingKm: null,
    closingKm: null,
    totalKm: null,
    totalHr: null,
  },
  assignmentDetails: {
    packageCategory: '',
    package: '',
    vehicleCategory: '',
    vehicle: '',
    staffCategory: '',
    staff: '',
  },
  vehicleDetails: {
    vehicleType: 'regular',
    vehicleCategory: null,
    vehicle: null,
    supplierDetails: {
      supplier: null,
      package: null,
    },
    newVehicleDetails: null,
  },
  staffDetails: {
    staffType: 'regular',
    staffCategory: null,
    staff: null,
    newStaffDetails: null,
  },
  otherCharges: {
    toll: {
      amount: 0,
      isChargeableToCustomer: false,
    },
    parking: {
      amount: 0,
      isChargeableToCustomer: false,
    },
    nightHalt: {
      amount: 0,
      isChargeableToCustomer: false,
      isPayableWithSalary: false,
    },
    driverAllowance: {
      amount: 0,
      isChargeableToCustomer: false,
      isPayableWithSalary: false,
    },
  },
  paymentDetails: {
    advanceAmountPaid: 0,
  },
  supplierExpense: 0,
  comment: '',
} as const
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

export const INITIAL_ADVANCE_BOOKING: AdvanceBookingModel = {
  customerType: 'existing',
  pickUpLocation: '',
  dropOffLocation: '',
  pickUpDateTime: null,
  noOfSeats: null,
  hasAc: false,
  vehicleType: '',
  customerCategory: null,
  customer: null,
  customerDetails: null,
  comment: '',
} as const

//
export interface AdvancePaymentModel {
  staffCategory: string
  staff: string
  paymentDate: Date | null
  paymentMethod: string
  amount: string | number
  comment: string
}

export const INITIAL_ADVANCE_PAYMENT: AdvancePaymentModel = {
  staffCategory: '',
  staff: '',
  paymentDate: null,
  paymentMethod: '',
  amount: '',
  comment: '',
} as const

//
export interface PackageModel {
  _id?: string
  category: string
  supplier?: string
  packageCode: string
  minimumKm: string | number
  minimumHr: string | number
  baseAmount: string | number
  extraKmPerKmRate: string | number
  extraHrPerHrRate: string | number
  comment?: string
  isActive: boolean
}

export const INITIAL_PACKAGE: PackageModel = {
  category: '',
  supplier: '',
  packageCode: '',
  minimumKm: '',
  minimumHr: '',
  baseAmount: '',
  extraKmPerKmRate: '',
  extraHrPerHrRate: '',
  comment: '',
  isActive: true,
} as const

//
export interface VehicleModel {
  type: string
  manufacturer: string
  name: string
  noOfSeats: string | number
  registrationNo: string
  hasAc: boolean
  supplier: string | null
  isMonthlyFixed: boolean
  monthlyFixedDetails: null | {
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
  comment: string
}

export const INITIAL_VEHICLE: VehicleModel = {
  type: '',
  manufacturer: '',
  name: '',
  noOfSeats: '',
  registrationNo: '',
  hasAc: false,
  supplier: '',
  isMonthlyFixed: false,
  monthlyFixedDetails: null,
  category: '',
  isActive: true,
  comment: '',
} as const

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

export const INITIAL_EXPENSE: ExpenseModel = {
  type: '',
  paymentMethod: '',
  date: null,
  amount: '',
  location: '',
  vehicleCategory: null,
  vehicle: null,
  staffCategory: null,
  staff: null,
  comment: '',
  category: '',
} as const
//
export interface UserProfile {
  // User details
  userId: string
  name: string
  contactNumber: string
  email: string
  designation: string
  role: any // Can be UserRole ObjectId or legacy string
  userGroup?: any // Can be UserGroup ObjectId or null
  isAdmin: boolean
  
  // Client details
  clientId: string
  agencyName: string
  agencyContactNumber: string
  agencyEmail: string
  address: Address
  pointOfContact: {
    name: string
    designation: string
    contactNumber: string
    email: string
  }
  subscriptionStatus: string
}

export const sampleUserProfile: UserProfile = {
  userId: '',
  name: '',
  contactNumber: '',
  email: '',
  designation: '',
  role: null,
  userGroup: null,
  isAdmin: false,
  clientId: '',
  agencyName: '',
  agencyContactNumber: '',
  agencyEmail: '',
  address: sampleAddress,
  pointOfContact: {
    name: '',
    designation: '',
    contactNumber: '',
    email: '',
  },
  subscriptionStatus: 'active',
}
//
export interface SupplierModel {
  companyName: string
  contact: string
  whatsAppNumber: string
  email: string
  address: Address
  pointOfContact: PointOfContact
  isActive: boolean
  comment?: string
}

export const INITIAL_SUPPLIER: SupplierModel = {
  companyName: '',
  contact: '',
  whatsAppNumber: '',
  email: '',
  address: sampleAddress,
  pointOfContact: samplePointOfContact,
  isActive: true,
  comment: '',
}

//
export interface StaffAccountRequest {
  request: {
    _id: string
    requestNo?: string
    customer?: {
      name: string
      _id: string
    }
    pickUpDateTime?: Date | string
    dropDateTime?: Date | string
    [key: string]: any
  }
  nightHalt: number
  driverAllowance: number
}

export interface StaffAccountModel {
  _id: string
  year: string
  month: string
  staff: {
    _id: string
    name: string
    salary: number
    [key: string]: any
  }
  staffCategory: string
  advancePayment: number
  totalNightHalt: number
  totalDriverAllowance: number
  requests: StaffAccountRequest[]
  createdAt: Date | string
}

//
export interface SupplierPaymentRequest {
  requestType: 'FixedRequest' | 'RegularRequest'
  request: {
    _id: string
    requestNo?: string
    customer?: {
      name: string
      _id: string
    }
    pickUpLocation?: string
    dropOffLocation?: string
    pickUpDateTime?: Date | string
    dropDateTime?: Date | string
    [key: string]: any
  }
  vehicle: {
    _id: string
    registrationNo: string
    [key: string]: any
  }
  package: {
    _id: string
    packageCode: string
    baseAmount: number
    minimumKm: number
    minimumHr: number
    extraKmPerKmRate: number
    extraHrPerHrRate: number
    [key: string]: any
  }
  totalKm: number
  totalHr: number
  extraKm: number
  extraHr: number
  amount: number
}

export interface SupplierPaymentModel {
  _id: string
  year: string
  month: string
  supplier: {
    _id: string
    companyName: string
    [key: string]: any
  }
  vehicle: {
    _id: string
    registrationNo: string
    [key: string]: any
  }
  totalAmount: number
  totalKm: number
  totalHr: number
  totalExtraKm: number
  totalExtraHr: number
  requests: SupplierPaymentRequest[]
  paymentDetails: {
    status: '' | 'BILL_GENERATED' | 'BILL_SENT_TO_SUPPLIER' | 'PAYMENT_MADE'
    paymentDate?: Date | string
    paymentMethod?: string
  }
  createdAt: Date | string
}

// --------------------------------------------------------------------------------------------------------
// User Role Types
// --------------------------------------------------------------------------------------------------------

export type ModuleName =
  | 'Dashboard'
  | 'Regular Requests'
  | 'Monthly Fixed Requests'
  | 'Packages'
  | 'Vehicles'
  | 'Staff'
  | 'Customers'
  | 'Expenses'
  | 'Vehicle Payments'
  | 'Staff Payments'
  | 'Supplier Payments'
  | 'Business Reports'
  | 'Vehicle Reports'
  | 'Advance Bookings'
  | 'Advance Payments'
  | 'User List'
  | 'User Roles'
  | 'User Groups'
  | 'Suppliers'
  | 'Configurations'
  | 'Profile'

export interface Permission {
  module: ModuleName
  view: boolean
  edit: boolean
  delete: boolean
}

export interface UserRoleModel {
  _id?: string
  roleName: string
  permissions: Permission[]
  isSystemRole?: boolean
  isActive?: boolean
  createdAt?: Date | string
}

export const MODULES: ModuleName[] = [
  'Dashboard',
  'Regular Requests',
  'Monthly Fixed Requests',
  'Packages',
  'Vehicles',
  'Staff',
  'Customers',
  'Expenses',
  'Vehicle Payments',
  'Staff Payments',
  'Supplier Payments',
  'Business Reports',
  'Vehicle Reports',
  'Advance Bookings',
  'Advance Payments',
  'User List',
  'User Roles',
  'User Groups',
  'Suppliers',
  'Configurations',
  'Profile',
]

export const INITIAL_USER_ROLE: UserRoleModel = {
  roleName: '',
  permissions: MODULES.map(module => ({
    module,
    view: false,
    edit: false,
    delete: false,
  })),
  isActive: true,
}

// User Management Types
export interface UserModel {
  _id?: string
  clientId: string
  name: string
  contactNumber: string
  email: string
  password?: string // User-set password for creation
  role: string | UserRoleModel // Can be populated or just ID
  userGroup?: string | UserGroupModel | null // Can be populated or just ID
  designation?: string
  isActive: boolean
  isAdmin?: boolean // Flag to identify admin user (cannot be edited/deleted)
  createdAt?: Date | string
}

export const INITIAL_USER: UserModel = {
  clientId: '',
  name: '',
  contactNumber: '',
  email: '',
  role: '',
  userGroup: null,
  password: '',
  designation: '',
  isActive: true,
}

// User Group Types
export interface UserGroupModel {
  _id?: string
  clientId?: string
  groupName: string
  isSystemGroup?: boolean
  isActive: boolean
  createdAt?: Date | string
}

export const INITIAL_USER_GROUP: UserGroupModel = {
  groupName: '',
  isSystemGroup: false,
  isActive: true,
}
