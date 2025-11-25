import React, { FunctionComponent } from 'react'
import { bemClass, formatNumber, generatePeriodOptions } from '@utils'
import { GrowthMetric, Period } from 'src/types/dashboard'
import Icon from '@base/icon'
import SelectInput from '@base/select-input'

import './style.scss'

const blk = 'growth-metric-tile'

interface GrowthMetricTileProps {
  title: string
  metric: GrowthMetric
  prefix?: string
  icon?: string
  className?: string
  period: Period
  onPeriodChange: (period: Period) => void
}

const GrowthMetricTile: FunctionComponent<GrowthMetricTileProps> = ({
  title,
  metric,
  prefix = '',
  icon,
  className = '',
  period,
  onPeriodChange
}) => {
  const { current, previous, growthPercentage } = metric
  const isPositive = growthPercentage >= 0
  const isZero = growthPercentage === 0

  const periodOptions = generatePeriodOptions()

  // Get growth indicator class
  const getGrowthClass = () => {
    if (isZero) return 'neutral'
    return isPositive ? 'positive' : 'negative'
  }

  // Handle period change
  const handlePeriodChange = (arg: Record<string, string | number>) => {
    onPeriodChange(arg.period as Period)
  }

  return (
    <div className={bemClass([blk, className])}>
      <div className={bemClass([blk, 'header'])}>
        <div className={bemClass([blk, 'header-left'])}>
          {icon && (
            <div className={bemClass([blk, 'icon'])}>
              <Icon name={icon} size="30" />
            </div>
          )}
          <h4 className={bemClass([blk, 'title'])}>{title}</h4>
        </div>
        <SelectInput
          label="Period"
          name="period"
          options={periodOptions}
          value={period}
          changeHandler={handlePeriodChange}
          hideLabel={true}
          showPlaceholder={false}
          className={bemClass([blk, 'period-select'])}
        />
      </div>

      <div className={bemClass([blk, 'content'])}>
        <div className={bemClass([blk, 'value'])}>
          {prefix}{formatNumber(current, { round: true })}
        </div>

        <div className={bemClass([blk, 'growth', [getGrowthClass()]])}>
          <Icon
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size="14"
          />
          <span className={bemClass([blk, 'growth-text'])}>
            {Math.abs(growthPercentage).toFixed(1)}%
          </span>
          <span className={bemClass([blk, 'growth-label'])}>
            vs previous period
          </span>
        </div>
      </div>

      <div className={bemClass([blk, 'footer'])}>
        <span className={bemClass([blk, 'previous'])}>
          Previous: {prefix}{formatNumber(previous, { round: true })}
        </span>
      </div>
    </div>
  )
}

export default GrowthMetricTile
