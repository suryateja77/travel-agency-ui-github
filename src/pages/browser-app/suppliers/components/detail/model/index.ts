import { Panel } from "@types";

export const supplierDetailsFields: Panel[] = [
  {
    panel: 'Basic Details',
    fields: [
      {
        label: 'Company Name',
        path: 'companyName',
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
    panel: 'Point of Contact',
    fields: [
      {
        label: 'Name',
        path: 'pointOfContact.name',
      },
      {
        label: 'Designation',
        path: 'pointOfContact.designation',
      },
      {
        label: 'Email',
        path: 'pointOfContact.email',
      },
      {
        label: 'Contact',
        path: 'pointOfContact.contact',
      },
    ],
  },
  {
    panel: 'Status',
    fields: [
      {
        label: 'Is Active',
        path: 'isActive',
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
