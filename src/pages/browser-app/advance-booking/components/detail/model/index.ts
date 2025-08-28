import { Panel } from "@types";

export const advanceBookingDetailsFields: Panel[] = [
  {
    panel: 'Booking Details',
    fields: [
      {
        label: 'Customer Type',
        path: 'customerType',
      },
      {
        label: 'Pickup Location',
        path: 'pickUpLocation',
      },
      {
        label: 'Drop Off Location',
        path: 'dropOffLocation',
      },
      {
        label: 'Pickup Date & Time',
        path: 'pickUpDateTime',
      },
      {
        label: 'Number of Seats',
        path: 'noOfSeats',
      },
      {
        label: 'Air Conditioning',
        path: 'hasAc',
      },
      {
        label: 'Vehicle Type',
        path: 'vehicleType',
      },
    ],
  },
  {
    panel: 'Customer Information',
    fields: [
      {
        label: 'Customer Category',
        path: 'customerCategory',
      },
      {
        label: 'Existing Customer',
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
    panel: 'Additional Information',
    fields: [
      {
        label: 'Comments',
        path: 'comment',
      },
    ],
  },
]
