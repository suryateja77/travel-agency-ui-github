import { Panel } from "@types";

export const vehicleDetailsFields: Panel[] = [
  {
    panel: 'Vehicle Details',
    fields: [
      {
        label: 'Supplier',
        path: 'supplier.companyName',
      },
      {
        label: 'Vehicle Type',
        path: 'type',
      },
      {
        label: 'Manufacturer',
        path: 'manufacturer',
      },
      {
        label: 'Vehicle Name',
        path: 'name',
      },
      {
        label: 'Number of Seats',
        path: 'noOfSeats',
      },
      {
        label: 'Registration Number',
        path: 'registrationNo',
      },
      {
        label: 'Is AC Required',
        path: 'hasAc',
      },
      {
        label: 'Is Monthly Fixed',
        path: 'isMonthlyFixed',
      },
    ],
  },
  {
    panel: 'Monthly Fixed Customer Details',
    fields: [
      {
        label: 'Customer category',
        path: 'monthlyFixedDetails.customerCategory',
      },
      {
        label: 'Customer',
        path: 'monthlyFixedDetails.customer.name',
      },
    ],
  },
  {
    panel: 'Monthly Fixed Package Details',
    fields: [
      {
        label: 'Package Category',
        path: 'monthlyFixedDetails.packageCategory',
      },
      {
        label: 'Package',
        path: 'monthlyFixedDetails.package.packageCode',
      },
    ],
  },
  {
    panel: 'Monthly Fixed Staff Details',
    fields: [
      {
        label: 'Staff Category',
        path: 'monthlyFixedDetails.staffCategory',
      },
      {
        label: 'Staff',
        path: 'monthlyFixedDetails.staff.name',
      },
    ],
  },
  {
    panel: 'Monthly Fixed Contract Details',
    fields: [
      {
        label: 'Contract Start Date',
        path: 'monthlyFixedDetails.contractStartDate',
      },
      {
        label: 'Contract End Date',
        path: 'monthlyFixedDetails.contractEndDate',
      },
    ],
  },
  {
    panel: 'Comments',
    fields: [
      {
        label: 'Comments',
        path: 'comments',
      },
    ],
  },
  {
    panel: 'Is active',
    fields: [
      {
        label: 'Is Active',
        path: 'isActive',
      },
    ],
  },
]
