import { FunctionComponent, useState, useMemo, useEffect } from 'react'
import { bemClass, nameToPath, downloadFile } from '@utils'
import { useToast } from '@contexts/ToastContext'

import './style.scss'
import { Alert, Button, Column, Row, SelectInput, Panel, ReadOnlyText } from '@base'
import PageHeader from '@components/page-header'
import EntityGrid from '@components/entity-grid'
import { useVehicleReportsQuery } from '@api/queries/vehicle-report'
import { useVehicleByCategory } from '@api/queries/vehicle'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

const blk = 'vehicle-report'

interface VehicleReportProps {}

const VehicleReport: FunctionComponent<VehicleReportProps> = () => {
  const { showToast } = useToast()
  
  const [filterData, setFilterData] = useState({
    vehicleCategory: '',
    vehicle: '',
    year: '',
  })

  const [searchFilters, setSearchFilters] = useState<Record<string, any> | undefined>(undefined)

  const yearOptions = [
    { key: '2024', value: '2024' },
    { key: '2025', value: '2025' },
  ]

  const breadcrumbData = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Vehicle Report' },
  ]

  // Category path for API queries
  const vehicleCategoryPath = useMemo(() => {
    return filterData.vehicleCategory ? nameToPath(filterData.vehicleCategory) : ''
  }, [filterData.vehicleCategory])

  // API queries
  const { data: vehicles, error: vehiclesError, isLoading: vehiclesLoading, isError: vehiclesIsError } = useVehicleByCategory(vehicleCategoryPath)
  const { data: reportsData, isLoading, error } = useVehicleReportsQuery(searchFilters)

  const [vehicleOptions, setVehicleOptions] = useState<{ key: any; value: any }[]>([])

  // API Error states
  const [apiErrors, setApiErrors] = useState({
    vehicles: '',
  })

  // Generic function to handle API responses and errors
  const handleApiResponse = (
    data: any,
    error: any,
    isError: boolean,
    errorKey: 'vehicles',
    setOptions: React.Dispatch<React.SetStateAction<{ key: any; value: any }[]>>,
    mapFunction: (item: any) => { key: any; value: any },
  ) => {
    if (isError) {
      const userFriendlyMessages = {
        vehicles: 'Unable to load vehicle data. Please check your connection and try again.',
      }
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: userFriendlyMessages[errorKey],
      }))
      setOptions([])
    } else if (data?.data?.length > 0) {
      const options = data.data.map(mapFunction)
      setOptions(options)
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: '',
      }))
    } else {
      setOptions([])
      setApiErrors(prev => ({
        ...prev,
        [errorKey]: '',
      }))
    }
  }

  // Generate options for SelectInput based on loading/error states
  const getSelectOptions = (isLoading: boolean, isError: boolean, options: { key: any; value: any }[], loadingText: string, errorText: string, noDataText: string) => {
    if (isLoading) return [{ key: 'loading', value: loadingText }]
    if (isError) return [{ key: 'error', value: errorText }]
    if (options.length > 0) return options
    return [{ key: 'no-data', value: noDataText }]
  }

  // Check if a value should be ignored in change handlers
  const isPlaceholderValue = (value: string, type: 'vehicles') => {
    const placeholders = {
      vehicles: ['Please wait...', 'Unable to load options', 'No vehicles found'],
    }
    return placeholders[type].includes(value)
  }

  // useEffect hooks to handle API responses
  useEffect(() => {
    handleApiResponse(vehicles, vehiclesError, vehiclesIsError, 'vehicles', setVehicleOptions, (vehicle: { _id: any; registrationNo: any }) => ({
      key: vehicle._id,
      value: vehicle.registrationNo,
    }))
  }, [vehicles, vehiclesError, vehiclesIsError])

  const columns = [
    {
      label: 'Period',
      custom: ({ month, year }: any) => {
        // If month exists, show month-year (monthly view), otherwise show year only (yearly view)
        if (month && month !== 'null') {
          return <>{year ? `${month}-${year}` : month}</>
        } else if (year && year !== 'null') {
          return <>{year}</>
        }
        return <>-</>
      },
    },
    {
      label: 'Total Local Requests',
      custom: ({ totalLocalRequests }: any) => <>{totalLocalRequests !== undefined && totalLocalRequests !== null ? totalLocalRequests.toLocaleString() : '-'}</>,
    },
    {
      label: 'Total Out Station Requests',
      custom: ({ totalOutStationRequests }: any) => <>{totalOutStationRequests !== undefined && totalOutStationRequests !== null ? totalOutStationRequests.toLocaleString() : '-'}</>,
    },
    {
      label: 'Income',
      custom: ({ income }: any) => {
        const numIncome = typeof income === 'string' ? parseFloat(income) : income
        return <>{numIncome !== undefined && numIncome !== null && !isNaN(numIncome) ? `₹${numIncome.toLocaleString()}` : '-'}</>
      },
    },
    {
      label: 'Expense',
      custom: ({ expense }: any) => {
        const numExpense = typeof expense === 'string' ? parseFloat(expense) : expense
        return <>{numExpense !== undefined && numExpense !== null && !isNaN(numExpense) ? `₹${numExpense.toLocaleString()}` : '-'}</>
      },
    },
    {
      label: 'Profit',
      custom: ({ income, expense, profit }: any) => {
        const numIncome = typeof income === 'string' ? parseFloat(income) : income
        const numExpense = typeof expense === 'string' ? parseFloat(expense) : expense
        const numProfit = typeof profit === 'string' ? parseFloat(profit) : profit

        const hasProfit = numProfit !== undefined && numProfit !== null && !isNaN(numProfit)
        if (hasProfit) return <>{`₹${numProfit.toLocaleString()}`}</>

        const hasIncome = numIncome !== undefined && numIncome !== null && !isNaN(numIncome)
        const hasExpense = numExpense !== undefined && numExpense !== null && !isNaN(numExpense)

        if (hasIncome && hasExpense) {
          const fallbackProfit = numIncome - numExpense
          return <>{`₹${fallbackProfit.toLocaleString()}`}</>
        } else if (hasIncome) {
          return <>{`₹${numIncome.toLocaleString()}`}</>
        } else if (hasExpense) {
          return <>{`-₹${numExpense.toLocaleString()}`}</>
        }
        return <>-</>
      },
    },
  ]

  // Calculate totals from current data
  const totals = useMemo(() => {
    const data = reportsData?.data || []
    let totalIncome = 0
    let totalExpense = 0
    let totalProfit = 0

    data.forEach((item: any) => {
      // Calculate income
      const numIncome = typeof item.income === 'string' ? parseFloat(item.income) : item.income
      if (numIncome !== undefined && numIncome !== null && !isNaN(numIncome)) {
        totalIncome += numIncome
      }

      // Calculate expense
      const numExpense = typeof item.expense === 'string' ? parseFloat(item.expense) : item.expense
      if (numExpense !== undefined && numExpense !== null && !isNaN(numExpense)) {
        totalExpense += numExpense
      }

      // Calculate profit (prefer stored profit, fall back to income - expense)
      const numProfit = typeof item.profit === 'string' ? parseFloat(item.profit) : item.profit
      const hasProfit = numProfit !== undefined && numProfit !== null && !isNaN(numProfit)
      if (hasProfit) {
        totalProfit += numProfit
      } else {
        const hasIncome = numIncome !== undefined && numIncome !== null && !isNaN(numIncome)
        const hasExpense = numExpense !== undefined && numExpense !== null && !isNaN(numExpense)
        if (hasIncome && hasExpense) {
          totalProfit += (numIncome - numExpense)
        } else if (hasIncome) {
          totalProfit += numIncome
        } else if (hasExpense) {
          totalProfit += (-numExpense)
        }
      }
    })

    return {
      totalIncome,
      totalExpense,
      totalProfit,
    }
  }, [reportsData?.data])

  const handleSearch = () => {
    const filters: Record<string, any> = {}
    if (filterData.vehicleCategory) filters.vehicleCategory = nameToPath(filterData.vehicleCategory)
    if (filterData.vehicle) filters.vehicle = filterData.vehicle
    if (filterData.year) filters.year = filterData.year

    setSearchFilters(Object.keys(filters).length > 0 ? filters : undefined)
  }
  
  // Determine if Search button should be enabled
  const isSearchEnabled = () => {
    // Case 1: Year alone is selected
    if (filterData.year && !filterData.vehicleCategory && !filterData.vehicle) {
      return true
    }
    // Case 2: Vehicle category and vehicle are selected (with or without year)
    if (filterData.vehicleCategory && filterData.vehicle) {
      return true
    }
    return false
  }

  const handleClear = () => {
    setFilterData({
      vehicleCategory: '',
      vehicle: '',
      year: '',
    })
    setSearchFilters(undefined)
  }

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: searchFilters || {},
      }
      await downloadFile('/vehicle-report/export/excel', `vehicle-reports-${filterData.year || 'all'}.xlsx`, filters)
      showToast('Excel file downloaded successfully', 'success')
    } catch (error) {
      console.error('Excel export failed:', error)
      showToast('Failed to download Excel file. Please try again.', 'error')
    }
  }

  const handleExportCsv = async () => {
    try {
      const filters = {
        filterData: searchFilters || {},
      }
      await downloadFile('/vehicle-report/export/csv', `vehicle-reports-${filterData.year || 'all'}.csv`, filters)
      showToast('CSV file downloaded successfully', 'success')
    } catch (error) {
      console.error('CSV export failed:', error)
      showToast('Failed to download CSV file. Please try again.', 'error')
    }
  }

  const handleExportPdf = async () => {
    try {
      const filters = {
        filterData: searchFilters || {},
      }
      await downloadFile('/vehicle-report/export/pdf', `vehicle-reports-${filterData.year || 'all'}.pdf`, filters)
      showToast('PDF file downloaded successfully', 'success')
    } catch (error) {
      console.error('PDF export failed:', error)
      showToast('Failed to download PDF file. Please try again.', 'error')
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Vehicle Report"
        withBreadCrumb
        breadCrumbData={breadcrumbData}
        showExport
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
      />
      {error && (
        <Alert
          type="error"
          message="Unable to load vehicle report data. Please check your connection and try again."
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      {apiErrors.vehicles && (
        <Alert
          type="error"
          message={`Some data could not be loaded: ${Object.values(apiErrors).filter(Boolean).join(' ')}`}
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      <div className={bemClass([blk, 'filter-section'])}>
        <Row>
          <Column
            col={2}
          >
            <ConfiguredInput
              name="vehicleCategory"
              label="Vehicle Category"
              type={CONFIGURED_INPUT_TYPES.SELECT}
              configToUse="Vehicle category"
              value={filterData.vehicleCategory}
              changeHandler={value => {
                setFilterData(prev => ({
                  ...prev,
                  vehicleCategory: value.vehicleCategory?.toString() || '',
                  vehicle: '', // Clear vehicle when category changes
                }))
              }}
            />
          </Column>
          <Column
            col={2}
          >
            <SelectInput
              label="Vehicle"
              name="vehicle"
              options={getSelectOptions(vehiclesLoading, vehiclesIsError, vehicleOptions, 'Please wait...', 'Unable to load options', 'No vehicles found')}
              value={filterData.vehicle ? ((vehicleOptions.find((option: any) => option.key === filterData.vehicle) as any)?.value ?? '') : ''}
              changeHandler={value => {
                if (isPlaceholderValue(value.vehicle?.toString() || '', 'vehicles')) return

                setFilterData(prev => ({
                  ...prev,
                  vehicle: value.vehicle ? vehicleOptions.find((option: any) => option.value === value.vehicle)?.key : '',
                }))
              }}
              disabled={!filterData.vehicleCategory || vehiclesLoading || vehiclesIsError}
            />
          </Column>
          <Column
            col={2}
          >
            <SelectInput
              label="Year"
              name="year"
              options={yearOptions}
              value={filterData.year}
              changeHandler={value => {
                setFilterData(prev => ({
                  ...prev,
                  year: value.year?.toString() || '',
                }))
              }}
            />
          </Column>
          <Column
            col={2}
            className={bemClass([blk, 'button-column'])}
          >
            <Button
              size="medium"
              clickHandler={handleSearch}
              disabled={!isSearchEnabled()}
            >
              Search
            </Button>
            <Button
              size="medium"
              category="error"
              clickHandler={handleClear}
            >
              Clear
            </Button>
          </Column>
        </Row>
      </div>
      <div className={bemClass([blk, 'totals-section'])}>
        <Row>
          <Column
            col={4}
            className={bemClass([blk, 'margin-bottom'])}
          >
            <ReadOnlyText
              label="Total Income"
              value={`₹${totals.totalIncome.toLocaleString()}`}
              color="success"
              size="jumbo"
            />
          </Column>
          <Column
            col={4}
            className={bemClass([blk, 'margin-bottom'])}
          >
            <ReadOnlyText
              label="Total Expense"
              value={`₹${totals.totalExpense.toLocaleString()}`}
              color="warning"
              size="jumbo"
            />
          </Column>
          <Column
            col={4}
            className={bemClass([blk, 'margin-bottom'])}
          >
            <ReadOnlyText
              label="Total Profit"
              value={`₹${totals.totalProfit.toLocaleString()}`}
              color={totals.totalProfit >= 0 ? 'success' : 'error'}
              size="jumbo"
            />
          </Column>
        </Row>
      </div>
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={reportsData?.data || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default VehicleReport
