import { Panel } from "@types";

export const staffDetailsFields: Panel[] = [
  {
    panel: 'Staff Details',
    fields: [
      {
        label: 'Name',
        path: 'name',
      },
      {
        label: 'Contact',
        path: 'contact',
      },
      {
        label: 'WhatsApp Number',
        path: 'whatsAppNumber'
      },
      {
        label: 'Email',
        path: 'email'
      },
      {
        label: 'Joining Date',
        path: 'joiningDate'
      },
      {
        label: 'Salary',
        path: 'salary'
      },
      {
        label: 'License',
        path: 'license'
      },
    ],
  },
  {
    panel: 'Address Details',
    fields: [
       {
        label: 'Address Line 1',
        path: 'address.addressLine1'
      },
      {
        label: 'Address Line 2',
        path: 'address.addressLine2',
      },
      {
        label: 'City',
        path: 'address.city'
      },
      {
        label: 'State',
        path: 'address.state'
      },
      {
        label: 'Pin Code',
        path: 'address.pinCode'
      }
    ]
  }
]
