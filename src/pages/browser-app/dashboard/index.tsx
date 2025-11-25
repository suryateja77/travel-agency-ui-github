import React, { FunctionComponent, useState } from 'react'
import { bemClass } from '@utils'
import { 
  useGrowthMetricsQuery,
  useMonthlyTripsQuery,
  useMonthlyProfitsQuery,
  useLeaderboardsQuery
} from '@api/queries/dashboard'
import { Period } from 'src/types/dashboard'
import Loader from '@components/loader'
import { Leaderboard, MonthlyChart, GrowthMetricTile, QuickLinks } from '@components'

import './style.scss'

const blk = 'dashboard'

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const currentYear = new Date().getFullYear()
  
  // Individual year states for each chart
  const [tripsByTypeYear, setTripsByTypeYear] = useState(currentYear)
  const [tripsByLocationYear, setTripsByLocationYear] = useState(currentYear)
  const [profitsYear, setProfitsYear] = useState(currentYear)
  const [leaderboardsYear, setLeaderboardsYear] = useState(currentYear)
  
  // Individual period states for each growth metric tile (default to 'week')
  const [localRequestsPeriod, setLocalRequestsPeriod] = useState<Period>('week')
  const [outstationRequestsPeriod, setOutstationRequestsPeriod] = useState<Period>('week')
  const [profitPeriod, setProfitPeriod] = useState<Period>('week')

  // Since all growth metrics share the same period for now, use one query
  // Can be split into 3 separate queries if individual periods are needed
  const { data: growthMetrics, isLoading: growthLoading, error: growthError } = useGrowthMetricsQuery(localRequestsPeriod)
  
  // Monthly charts - independent queries with individual years
  const { data: tripsByTypeData, isLoading: tripsTypeLoading, error: tripsTypeError } = useMonthlyTripsQuery(tripsByTypeYear, 'byType')
  const { data: tripsByLocationData, isLoading: tripsLocationLoading, error: tripsLocationError } = useMonthlyTripsQuery(tripsByLocationYear, 'byLocation')
  const { data: profitsData, isLoading: profitsLoading, error: profitsError } = useMonthlyProfitsQuery(profitsYear)
  
  // Leaderboards - single query for all boards
  const { data: leaderboards, isLoading: leaderboardsLoading, error: leaderboardsError } = useLeaderboardsQuery(leaderboardsYear)

  // Individual year change handlers for charts
  const handleTripsByTypeYearChange = (year: number) => {
    setTripsByTypeYear(year)
  }
  
  const handleTripsByLocationYearChange = (year: number) => {
    setTripsByLocationYear(year)
  }
  
  const handleProfitsYearChange = (year: number) => {
    setProfitsYear(year)
  }
  
  // Individual period change handlers for growth metric tiles
  const handleLocalRequestsPeriodChange = (period: Period) => {
    setLocalRequestsPeriod(period)
  }
  
  const handleOutstationRequestsPeriodChange = (period: Period) => {
    setOutstationRequestsPeriod(period)
  }
  
  const handleProfitPeriodChange = (period: Period) => {
    setProfitPeriod(period)
  }

  // Check if initial critical data is still loading
  const isInitialLoading = growthLoading && tripsTypeLoading && profitsLoading && leaderboardsLoading
  
  if (isInitialLoading) {
    return (
      <div className={bemClass([blk])}>
        <Loader type="form" />
      </div>
    )
  }

  // Check for critical errors (show error only if all major sections fail)
  const hasCriticalError = (growthError && tripsTypeError && profitsError && leaderboardsError)
  
  if (hasCriticalError) {
    return (
      <div className={bemClass([blk])}>
        <div className={bemClass([blk, 'error'])}>
          <p>Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={bemClass([blk])}>
      {/* Header */}
      <div className={bemClass([blk, 'header'])}>
        <h1 className={bemClass([blk, 'title'])}>Dashboard</h1>
      </div>

      {/* Growth Metrics */}
      <section className={bemClass([blk, 'section'])}>
        <div className={bemClass([blk, 'growth-metrics'])}>
          {growthLoading ? (
            <Loader type="form" />
          ) : growthMetrics ? (
            <>
              <GrowthMetricTile
                title="Local Requests"
                metric={growthMetrics.localRequests}
                icon="location-dot"
                period={localRequestsPeriod}
                onPeriodChange={handleLocalRequestsPeriodChange}
              />
              <GrowthMetricTile
                title="Outstation Requests"
                metric={growthMetrics.outstationRequests}
                icon="route"
                period={outstationRequestsPeriod}
                onPeriodChange={handleOutstationRequestsPeriodChange}
              />
              <GrowthMetricTile
                title="Profit"
                metric={growthMetrics.profit}
                prefix="₹"
                icon="chart-line"
                period={profitPeriod}
                onPeriodChange={handleProfitPeriodChange}
              />
            </>
          ) : (
            <div className={bemClass([blk, 'error'])}>Failed to load growth metrics</div>
          )}
        </div>
      </section>

      {/* Quick Links - Moved above charts */}
      <section className={bemClass([blk, 'section'])}>
        <QuickLinks />
      </section>

      {/* Monthly Charts */}
      <section className={bemClass([blk, 'section'])}>
        <div className={bemClass([blk, 'charts', ['three-column']])}>
          <MonthlyChart
            data={tripsByTypeData?.data}
            title="Request Type Distribution"
            type="tripsByType"
            year={tripsByTypeYear}
            onYearChange={handleTripsByTypeYearChange}
            isLoading={tripsTypeLoading}
            error={tripsTypeError}
          />

          <MonthlyChart
            data={tripsByLocationData?.data}
            title="Location Distribution"
            type="tripsByLocation"
            year={tripsByLocationYear}
            onYearChange={handleTripsByLocationYearChange}
            isLoading={tripsLocationLoading}
            error={tripsLocationError}
          />

          <MonthlyChart
            data={profitsData?.data}
            title="Monthly Profit Trends"
            type="profits"
            year={profitsYear}
            onYearChange={handleProfitsYearChange}
            isLoading={profitsLoading}
            error={profitsError}
          />
        </div>
      </section>

      {/* Leaderboards */}
      <section className={bemClass([blk, 'section'])}>
        <h2 className={bemClass([blk, 'section-title'])}>Top Performers</h2>
        {leaderboardsLoading ? (
          <Loader type="form" />
        ) : leaderboards ? (
          <div className={bemClass([blk, 'leaderboards'])}>
            <Leaderboard
              data={leaderboards.topCustomers || []}
              title="Top Customers by Profit"
              metricLabel="Profit"
              metricKey="totalProfit"
            />
            <Leaderboard
              data={leaderboards.topVehicles || []}
              title="Top Vehicles by Profit"
              metricLabel="Profit"
              metricKey="totalProfit"
            />
            <Leaderboard
              data={leaderboards.topPackagesByProfit || []}
              title="Most Profitable Packages"
              metricLabel="Profit"
              metricKey="totalProfit"
            />
            <Leaderboard
              data={leaderboards.mostUsedPackages || []}
              title="Most Used Packages"
              metricLabel="Usage Count"
              metricKey="totalUsage"
            />
            <Leaderboard
              data={leaderboards.topDrivers || []}
              title="Most Active Drivers"
              metricLabel="Total Trips"
              metricKey="totalTrips"
              showCategory={true}
            />
          </div>
        ) : (
          <div className={bemClass([blk, 'error'])}>Failed to load leaderboards</div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
