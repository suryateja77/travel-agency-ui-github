import { Panel } from "@types";

export const advancePaymentDetailsFields: Panel[] = [
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
    panel: 'Payment Details',
    fields: [
      {
        label: 'Payment Date',
        path: 'paymentDate',
      },
      {
        label: 'Amount',
        path: 'amount',
      },
      {
        label: 'Payment Method',
        path: 'paymentMethod',
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
