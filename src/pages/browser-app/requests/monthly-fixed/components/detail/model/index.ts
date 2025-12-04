import { Panel } from "@types";

export const monthlyFixedRequestDetailsFields: Panel[] = [
  {
    panel: 'Assignment Details',
    fields: [
      {
        label: 'Package Category',
        path: 'assignmentDetails.packageCategory',
      },
      {
        label: 'Package',
        path: 'assignmentDetails.package.packageCode',
      },
      {
        label: 'Vehicle Category',
        path: 'assignmentDetails.vehicleCategory',
      },
      {
        label: 'Vehicle',
        path: 'assignmentDetails.vehicle.name',
      },
      {
        label: 'Vehicle Registration',
        path: 'assignmentDetails.vehicle.registrationNo',
      },
      {
        label: 'Staff Category',
        path: 'assignmentDetails.staffCategory',
      },
      {
        label: 'Staff',
        path: 'assignmentDetails.staff.name',
      },
    ],
  },
  {
    panel: 'Request Details',
    fields: [
      {
        label: 'Request Type',
        path: 'requestDetails.requestType',
      },
      {
        label: 'Pickup Location',
        path: 'requestDetails.pickUpLocation',
      },
      {
        label: 'Drop Location',
        path: 'requestDetails.dropOffLocation',
      },
      {
        label: 'Pickup Date and Time',
        path: 'requestDetails.pickUpDateTime',
      },
      {
        label: 'Drop Date and Time',
        path: 'requestDetails.dropDateTime',
      },
      {
        label: 'Duration',
        path: 'requestDetails.totalHr',
      },
      {
        label: 'Opening Km',
        path: 'requestDetails.openingKm',
      },
      {
        label: 'Closing Km',
        path: 'requestDetails.closingKm',
      },
      {
        label: 'Total Distance',
        path: 'requestDetails.totalKm',
      },
      {
        label: 'AC Required',
        path: 'requestDetails.ac',
      },
    ],
  },
  {
    panel: 'Customer Details',
    fields: [
      {
        label: 'Customer Category',
        path: 'customerDetails.customerCategory',
      },
      {
        label: 'Customer',
        path: 'customerDetails.customer.name',
      },
    ],
  },
  {
    panel: 'Vehicle Details',
    fields: [
      {
        label: 'Vehicle Type',
        path: 'vehicleDetails.vehicleType',
      },
      {
        label: 'Vehicle Category',
        path: 'vehicleDetails.vehicleCategory',
      },
      {
        label: 'Vehicle',
        path: 'vehicleDetails.vehicle.name',
      },
      {
        label: 'Vehicle Registration',
        path: 'vehicleDetails.vehicle.registrationNo',
      },
      {
        label: 'Supplier',
        path: 'vehicleDetails.supplierDetails.supplier.companyName',
      },
      {
        label: 'Supplier Package',
        path: 'vehicleDetails.supplierDetails.package.packageCode',
      },
      {
        label: 'New Vehicle Owner Name',
        path: 'vehicleDetails.newVehicleDetails.ownerName',
      },
      {
        label: 'New Vehicle Owner Contact',
        path: 'vehicleDetails.newVehicleDetails.ownerContact',
      },
      {
        label: 'New Vehicle Owner Email',
        path: 'vehicleDetails.newVehicleDetails.ownerEmail',
      },
      {
        label: 'New Vehicle Manufacturer',
        path: 'vehicleDetails.newVehicleDetails.manufacturer',
      },
      {
        label: 'New Vehicle Name',
        path: 'vehicleDetails.newVehicleDetails.name',
      },
      {
        label: 'New Vehicle Registration',
        path: 'vehicleDetails.newVehicleDetails.registrationNo',
      },
    ],
  },
  {
    panel: 'Staff Details',
    fields: [
      {
        label: 'Staff Type',
        path: 'staffDetails.staffType',
      },
      {
        label: 'Staff Category',
        path: 'staffDetails.staffCategory',
      },
      {
        label: 'Staff',
        path: 'staffDetails.staff.name',
      },
      {
        label: 'New Staff Name',
        path: 'staffDetails.newStaffDetails.name',
      },
      {
        label: 'New Staff Contact',
        path: 'staffDetails.newStaffDetails.contact',
      },
      {
        label: 'New Staff License',
        path: 'staffDetails.newStaffDetails.license',
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
    panel: 'Comments',
    fields: [
      {
        label: 'Comments',
        path: 'comment',
      },
    ],
  },
]