import { Panel } from "@types";

export const customerDetailsFields: Panel[] = [
  {
    panel: 'Customer details',
    fields: [
      {
        label: 'Customer Name',
        path: 'name',
      },
      {
        label: 'Contact',
        path: 'contact',
      },
      {
        label: 'WhatsApp Number',
        path: 'whatsAppNumber',
      },
      {
        label: 'Email',
        path: 'email',
      },
    ],
  },
  {
    panel: 'Address Details',
    fields: [
      {
        label: 'Address Line 1',
        path: 'address.addressLine1',
      },
      {
        label: 'Address Line 2',
        path: 'address.addressLine2',
      },
      {
        label: 'City',
        path: 'address.city',
      },
      {
        label: 'State',
        path: 'address.state',
      },
      {
        label: 'Pin Code',
        path: 'address.pinCode',
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
