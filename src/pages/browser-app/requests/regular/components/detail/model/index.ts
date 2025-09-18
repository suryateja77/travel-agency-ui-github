import { Panel } from "@types";

export const regularRequestDetailsFields: Panel[] = [
  {
    panel: 'Request Details',
    fields: [
      {
        label: 'Customer Type',
        path: 'customerType',
      },
      {
        label: 'Vehicle Type',
        path: 'vehicleType',
      },
      {
        label: 'Staff Type',
        path: 'staffType',
      },
      {
        label: 'Request Type',
        path: 'requestType',
      },
      {
        label: 'Pickup Location',
        path: 'pickUpLocation',
      },
      {
        label: 'Drop Location',
        path: 'dropOffLocation',
      },
      {
        label: 'Pickup Date and Time',
        path: 'pickUpDateTime',
      },
      {
        label: 'Drop Date and Time',
        path: 'dropDateTime',
      },
      {
        label: 'Duration',
        path: 'totalHr',
      },
      {
        label: 'Opening Km',
        path: 'openingKm',
      },
      {
        label: 'Closing Km',
        path: 'closingKm',
      },
      {
        label: 'Total Distance',
        path: 'totalKm',
      },
      {
        label: 'AC Required',
        path: 'ac',
      },
    ],
  },
  {
    panel: 'Customer Details',
    fields: [
      {
        label: 'Customer Category',
        path: 'customerCategory',
      },
      {
        label: 'Customer',
        path: 'customer.name',
      },
      {
        label: 'Customer Name',
        path: 'customerDetails.name',
      },
      {
        label: 'Customer Contact',
        path: 'customerDetails.contact',
      },
      {
        label: 'Customer Email',
        path: 'customerDetails.email',
      },
    ],
  },
  {
    panel: 'Vehicle Details',
    fields: [
      {
        label: 'Vehicle Category',
        path: 'vehicleCategory',
      },
      {
        label: 'Supplier',
        path: 'supplier.companyName',
      },
      {
        label: 'Supplier Package',
        path: 'supplierPackage.packageCode',
      },
      {
        label: 'Vehicle',
        path: 'vehicle.name',
      },
      {
        label: 'Owner Name',
        path: 'vehicleDetails.ownerName',
      },
      {
        label: 'Owner Contact',
        path: 'vehicleDetails.ownerContact',
      },
      {
        label: 'Owner Email',
        path: 'vehicleDetails.ownerEmail',
      },
      {
        label: 'Manufacturer',
        path: 'vehicleDetails.manufacturer',
      },
      {
        label: 'Vehicle Name',
        path: 'vehicleDetails.name',
      },
      {
        label: 'Registration Number',
        path: 'vehicleDetails.registrationNo',
      },
    ],
  },
  {
    panel: 'Provider Package Details',
    fields: [
      {
        label: 'Package Category',
        path: 'packageFromProvidedVehicle.packageCategory',
      },
      {
        label: 'Package',
        path: 'packageFromProvidedVehicle.package.packageCode',
      },
    ],
  },
  {
    panel: 'Staff Details',
    fields: [
      {
        label: 'Staff Category',
        path: 'staffCategory',
      },
      {
        label: 'Staff',
        path: 'staff.name',
      },
      {
        label: 'Staff Name',
        path: 'staffDetails.name',
      },
      {
        label: 'Staff Contact',
        path: 'staffDetails.contact',
      },
      {
        label: 'Staff License',
        path: 'staffDetails.license',
      },
    ],
  },
  {
    panel: 'Package Details',
    fields: [
      {
        label: 'Package Category',
        path: 'packageCategory',
      },
      {
        label: 'Package',
        path: 'package.packageCode',
      },
    ],
  },
  {
    panel: 'Other Charges',
    fields: [
      {
        label: 'Toll Amount',
        path: 'otherCharges.toll.amount',
      },
      {
        label: 'Toll Chargeable to Customer',
        path: 'otherCharges.toll.isChargeableToCustomer',
      },
      {
        label: 'Parking Amount',
        path: 'otherCharges.parking.amount',
      },
      {
        label: 'Parking Chargeable to Customer',
        path: 'otherCharges.parking.isChargeableToCustomer',
      },
      {
        label: 'Night Halt Amount',
        path: 'otherCharges.nightHalt.amount',
      },
      {
        label: 'Night Halt Chargeable to Customer',
        path: 'otherCharges.nightHalt.isChargeableToCustomer',
      },
      {
        label: 'Night Halt Payable with Salary',
        path: 'otherCharges.nightHalt.isPayableWithSalary',
      },
      {
        label: 'Driver Allowance Amount',
        path: 'otherCharges.driverAllowance.amount',
      },
      {
        label: 'Driver Allowance Chargeable to Customer',
        path: 'otherCharges.driverAllowance.isChargeableToCustomer',
      },
      {
        label: 'Driver Allowance Payable with Salary',
        path: 'otherCharges.driverAllowance.isPayableWithSalary',
      },
    ],
  },
  {
    panel: 'Advanced Payment',
    fields: [
      {
        label: 'Advanced from Customer',
        path: 'advancedPayment.advancedFromCustomer',
      },
      {
        label: 'Advanced to Supplier',
        path: 'advancedPayment.advancedToSupplier',
      },
    ],
  },
  {
    panel: 'Payment Details',
    fields: [
      {
        label: 'Payment Status',
        path: 'paymentDetails.status',
      },
      {
        label: 'Payment Method',
        path: 'paymentDetails.paymentMethod',
      },
      {
        label: 'Payment Date',
        path: 'paymentDetails.paymentDate',
      },
    ],
  },
  {
    panel: 'Calculation Results',
    fields: [
      {
        label: 'Request Total',
        path: 'requestTotal',
      },
      {
        label: 'Request Expense',
        path: 'requestExpense',
      },
      {
        label: 'Request Profit',
        path: 'requestProfit',
      },
      {
        label: 'Customer Bill',
        path: 'customerBill',
      },
    ],
  },
  {
    panel: 'Comments',
    fields: [
      {
        label: 'Comments',
        path: 'comment',
      },
    ],
  },
]