import { useQuery } from '@tanstack/react-query'
import { get } from '@api'
import { 
  DashboardData, 
  Period, 
  GrowthMetrics, 
  MonthlyTripsByType, 
  MonthlyTripsByLocation, 
  MonthlyProfit,
  Leaderboards 
} from 'src/types/dashboard'

interface DashboardQueryParams {
  year?: number
  period?: Period
}

// Legacy hook - kept for backward compatibility (deprecated)
export const useDashboardDataQuery = (params: DashboardQueryParams = {}) => {
  const { year = new Date().getFullYear(), period = 'month' } = params

  return useQuery<DashboardData>({
    queryKey: ['dashboard', year, period],
    queryFn: async () => {
      const response = await get('/dashboard', {
        params: { year, period }
      })
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

/**
 * Hook for fetching growth metrics (period-based)
 * Used by: GrowthMetricTile components
 */
export const useGrowthMetricsQuery = (period: Period = 'week') => {
  return useQuery<GrowthMetrics>({
    queryKey: ['dashboard', 'growth-metrics', period],
    queryFn: async () => {
      const response = await get('/dashboard/growth-metrics', {
        params: { period }
      })
      return response.data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent refresh for growth data)
    refetchOnWindowFocus: false
  })
}

/**
 * Hook for fetching monthly trips data (year and type-based)
 * Used by: MonthlyChart components (tripsByType and tripsByLocation)
 */
export const useMonthlyTripsQuery = (year: number, type: 'byType' | 'byLocation') => {
  return useQuery<{ data: MonthlyTripsByType[] | MonthlyTripsByLocation[], year: number, type: string }>({
    queryKey: ['dashboard', 'monthly-trips', year, type],
    queryFn: async () => {
      const response = await get('/dashboard/monthly-trips', {
        params: { year, type }
      })
      return response.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (historical data changes less frequently)
    refetchOnWindowFocus: false
  })
}

/**
 * Hook for fetching monthly profits (year-based)
 * Used by: MonthlyChart profit component
 */
export const useMonthlyProfitsQuery = (year: number) => {
  return useQuery<{ data: MonthlyProfit[], year: number }>({
    queryKey: ['dashboard', 'monthly-profits', year],
    queryFn: async () => {
      const response = await get('/dashboard/monthly-profits', {
        params: { year }
      })
      return response.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false
  })
}

/**
 * Hook for fetching leaderboards (year-based)
 * Used by: Leaderboard components
 */
export const useLeaderboardsQuery = (year: number) => {
  return useQuery<Leaderboards & { year: number }>({
    queryKey: ['dashboard', 'leaderboards', year],
    queryFn: async () => {
      const response = await get('/dashboard/leaderboards', {
        params: { year }
      })
      return response.data
    },
    staleTime: 1000 * 60 * 15, // 15 minutes (leaderboards change infrequently)
    refetchOnWindowFocus: false
  })
}
