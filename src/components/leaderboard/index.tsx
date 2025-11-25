import React, { FunctionComponent, useState, useMemo } from 'react'
import { bemClass, formatNumber } from '@utils'
import { LeaderboardItem, SortOrder } from 'src/types/dashboard'
import Table from '@base/table'
import Icon from '@base/icon'

import './style.scss'

const blk = 'leaderboard'

interface LeaderboardProps {
  data: LeaderboardItem[]
  title: string
  metricLabel: string
  metricKey: 'totalProfit' | 'totalTrips' | 'totalUsage'
  className?: string
  showCategory?: boolean
}

const Leaderboard: FunctionComponent<LeaderboardProps> = ({
  data,
  title,
  metricLabel,
  metricKey,
  className = '',
  showCategory = true
}) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Sort data based on current sort order
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return [...data].sort((a, b) => {
      const aValue = a[metricKey] || 0
      const bValue = b[metricKey] || 0
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })
  }, [data, metricKey, sortOrder])

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  // Get display name for leaderboard item
  const getDisplayName = (item: LeaderboardItem) => {
    if (item.name) return item.name
    if (item.packageCode) return item.packageCode
    if (item.registrationNo) return item.registrationNo
    return 'N/A'
  }

  const columns = [
    {
      label: '#',
      custom: (item: any) => {
        const index = sortedData.indexOf(item)
        return (
          <div className={bemClass([blk, 'rank'])}>
            {index + 1}
          </div>
        )
      }
    },
    {
      label: 'Name',
      custom: (item: LeaderboardItem) => (
        <div className={bemClass([blk, 'name'])}>
          {getDisplayName(item)}
          {item.registrationNo && item.name && (
            <span className={bemClass([blk, 'subtitle'])}>
              {item.registrationNo}
            </span>
          )}
        </div>
      )
    }
  ]

  if (showCategory) {
    columns.push({
      label: 'Category',
      custom: (item: LeaderboardItem) => (
        <div className={bemClass([blk, 'category'])}>
          {item.category || '-'}
        </div>
      )
    })
  }

  columns.push({
    label: metricLabel,
    custom: (item: LeaderboardItem) => (
      <div className={bemClass([blk, 'metric'])}>
        {formatNumber(item[metricKey] || 0)}
      </div>
    )
  })

  return (
    <div className={bemClass([blk, className])}>
      <div className={bemClass([blk, 'header'])}>
        <h3 className={bemClass([blk, 'title'])}>{title}</h3>
        <button
          className={bemClass([blk, 'sort-button'])}
          onClick={toggleSort}
          title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
        >
          <Icon
            name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
            size="16"
          />
          <span>{sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}</span>
        </button>
      </div>
      
      <div className={bemClass([blk, 'content'])}>
        <Table
          columns={columns}
          data={sortedData}
          hoverEffect={true}
        />
      </div>
      
      {sortedData.length === 0 && (
        <div className={bemClass([blk, 'empty'])}>
          No data available for this period
        </div>
      )}
    </div>
  )
}

export default Leaderboard
