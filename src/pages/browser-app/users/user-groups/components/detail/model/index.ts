import { Panel } from '@types'

export const detailTemplate: Panel[] = [
  {
    panel: 'Basic Information',
    fields: [
      { label: 'Group Name', path: 'groupName' },
      { label: 'System Group', path: 'isSystemGroup' },
      { label: 'Status', path: 'isActive' },
      { label: 'Created At', path: 'createdAt' },
    ],
  },
]
