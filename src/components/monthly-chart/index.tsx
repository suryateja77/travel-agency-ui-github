import React, { FunctionComponent } from 'react'
import { bemClass, formatNumber, generateYearOptions } from '@utils'
import { MonthlyTripsByType, MonthlyTripsByLocation, MonthlyProfit } from 'src/types/dashboard'
import SelectInput from '@base/select-input'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

import './style.scss'

const blk = 'monthly-chart'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface MonthlyChartProps {
  data?: MonthlyTripsByType[] | MonthlyTripsByLocation[] | MonthlyProfit[]
  title: string
  type: 'tripsByType' | 'tripsByLocation' | 'profits'
  year: number
  onYearChange: (year: number) => void
  isLoading?: boolean
  error?: any
  className?: string
}

const MonthlyChart: FunctionComponent<MonthlyChartProps> = ({
  data,
  title,
  type,
  year,
  onYearChange,
  isLoading = false,
  error = null,
  className = ''
}) => {
  const yearOptions = generateYearOptions(5)

  const handleYearChange = (arg: Record<string, string | number>) => {
    onYearChange(Number(arg.year))
  }

  // Transform data for Recharts format
  const chartData = data?.map((monthData, index) => {
    if (type === 'tripsByType') {
      const d = monthData as MonthlyTripsByType
      return {
        month: MONTHS[index],
        'Regular Requests': d.regular,
        'Monthly Fixed': d.fixed
      }
    } else if (type === 'tripsByLocation') {
      const d = monthData as MonthlyTripsByLocation
      return {
        month: MONTHS[index],
        'Local': d.local,
        'Outstation': d.outstation
      }
    } else {
      const d = monthData as MonthlyProfit
      return {
        month: MONTHS[index],
        'Profit': d.profit
      }
    }
  })

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={bemClass([blk, 'custom-tooltip'])}>
          <p className={bemClass([blk, 'tooltip-label'])}>{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className={bemClass([blk, 'tooltip-value'])}>
              {entry.name}: {type === 'profits' ? `₹${formatNumber(entry.value)}` : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Chart colors based on type
  const getChartConfig = () => {
    if (type === 'tripsByType') {
      return {
        bars: [
          { dataKey: 'Regular Requests', fill: '#2196F3', stackId: 'a' },
          { dataKey: 'Monthly Fixed', fill: '#FF9800', stackId: 'a' }
        ]
      }
    } else if (type === 'tripsByLocation') {
      return {
        bars: [
          { dataKey: 'Local', fill: '#4CAF50', stackId: 'a' },
          { dataKey: 'Outstation', fill: '#F44336', stackId: 'a' }
        ]
      }
    } else {
      return {
        bars: [
          { dataKey: 'Profit', fill: '#10B981', stackId: 'a' }
        ]
      }
    }
  }

  const chartConfig = getChartConfig()

  return (
    <div className={bemClass([blk, className])}>
      <div className={bemClass([blk, 'header'])}>
        <h3 className={bemClass([blk, 'title'])}>{title}</h3>
        <SelectInput
          label="Year"
          name="year"
          options={yearOptions}
          value={year.toString()}
          changeHandler={handleYearChange}
          hideLabel={true}
          showPlaceholder={false}
        />
      </div>

      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <div className={bemClass([blk, 'loader-container'])}>
            <div className={bemClass([blk, 'loader'])} />
          </div>
        ) : error ? (
          <div className={bemClass([blk, 'error-message'])}>
            Failed to load chart data
          </div>
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => type === 'profits' ? `₹${formatNumber(value)}` : formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
                iconSize={12}
              />
              {chartConfig.bars.map((bar, index) => (
                <Bar 
                  key={index}
                  dataKey={bar.dataKey} 
                  fill={bar.fill} 
                  stackId={bar.stackId}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={bemClass([blk, 'empty-message'])}>
            No data available for this period
          </div>
        )}
      </div>
    </div>
  )
}

export default MonthlyChart
