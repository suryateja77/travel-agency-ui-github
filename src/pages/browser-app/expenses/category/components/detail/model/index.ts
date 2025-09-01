import { Panel } from "@types";

export const expenseDetailsFields: Panel[] = [
  {
    panel: 'Expense Details',
    fields: [
      {
        label: 'Expense Type',
        path: 'type',
      },
      {
        label: 'Payment Mode',
        path: 'paymentMethod',
      },
      {
        label: 'Expense Date',
        path: 'date',
      },
      {
        label: 'Expense Amount',
        path: 'amount',
      },
      {
        label: 'Location',
        path: 'location',
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
        label: 'Vehicle',
        path: 'vehicle.name',
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
