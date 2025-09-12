import { Panel } from "@types";

export const packageDetailsFields: Panel[] = [
  {
    panel: 'Package details',
    fields: [
      {
        label: 'Supplier',
        path: 'supplier.companyName',
      },
      {
        label: 'Package Code',
        path: 'packageCode',
      },
      {
        label: 'Minimum Km',
        path: 'minimumKm',
      },
      {
        label: 'Minimum Hours',
        path: 'minimumHr',
      },
      {
        label: 'Base Amount',
        path: 'baseAmount',
      },
      {
        label: 'Extra Km Per Km Rate',
        path: 'extraKmPerKmRate',
      },
      {
        label: 'Extra Hr Per Hr Rate',
        path: 'extraHrPerHrRate',
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
    panel: 'Status',
    fields: [
      {
        label: 'Is Active',
        path: 'isActive',
      },
    ],
  },
]
