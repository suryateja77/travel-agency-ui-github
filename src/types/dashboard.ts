// Dashboard type definitions

export interface LeaderboardItem {
  _id: string
  name?: string
  registrationNo?: string
  packageCode?: string
  category: string
  totalProfit?: number
  totalTrips?: number
  totalUsage?: number
}

export interface MonthlyTripsByType {
  month: number
  regular: number
  fixed: number
}

export interface MonthlyTripsByLocation {
  month: number
  local: number
  outstation: number
}

export interface MonthlyProfit {
  month: number
  profit: number
}

export interface GrowthMetric {
  current: number
  previous: number
  growthPercentage: number
}

export interface GrowthMetrics {
  localRequests: GrowthMetric
  outstationRequests: GrowthMetric
  profit: GrowthMetric
}

export interface Leaderboards {
  topCustomers: LeaderboardItem[]
  topVehicles: LeaderboardItem[]
  topPackagesByProfit: LeaderboardItem[]
  mostUsedPackages: LeaderboardItem[]
  topDrivers: LeaderboardItem[]
}

export interface MonthlyMetrics {
  tripsByType: MonthlyTripsByType[]
  tripsByLocation: MonthlyTripsByLocation[]
  profits: MonthlyProfit[]
}

export interface DashboardData {
  leaderboards: Leaderboards
  monthlyMetrics: MonthlyMetrics
  growthMetrics: GrowthMetrics
  year: number
  period: 'week' | 'month'
}

export type SortOrder = 'asc' | 'desc'

export type Period = 'week' | 'month'
