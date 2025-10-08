import { FunctionComponent, useState, useMemo, useEffect } from 'react'
import { bemClass, nameToPath } from '@utils'

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
      label: 'Month-Year',
      custom: ({ month, year }: any) => <>{month && year ? `${month}-${year}` : '-'}</>,
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
      custom: ({ income, expense }: any) => {
        const numIncome = typeof income === 'string' ? parseFloat(income) : income
        const numExpense = typeof expense === 'string' ? parseFloat(expense) : expense

        const hasIncome = numIncome !== undefined && numIncome !== null && !isNaN(numIncome)
        const hasExpense = numExpense !== undefined && numExpense !== null && !isNaN(numExpense)

        if (hasIncome && hasExpense) {
          const profit = numIncome - numExpense
          return <>{`₹${profit.toLocaleString()}`}</>
        } else if (hasIncome) {
          return <>{`₹${numIncome.toLocaleString()}`}</>
        } else if (hasExpense) {
          return <>{`-₹${numExpense.toLocaleString()}`}</>
        } else {
          return <>-</>
        }
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

      // Calculate profit (income - expense for each row)
      const hasIncome = numIncome !== undefined && numIncome !== null && !isNaN(numIncome)
      const hasExpense = numExpense !== undefined && numExpense !== null && !isNaN(numExpense)

      if (hasIncome && hasExpense) {
        totalProfit += (numIncome - numExpense)
      } else if (hasIncome) {
        totalProfit += numIncome
      } else if (hasExpense) {
        totalProfit += (-numExpense)
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
    if (filterData.vehicleCategory) filters.vehicleCategory = filterData.vehicleCategory
    if (filterData.vehicle) filters.vehicle = filterData.vehicle
    if (filterData.year) filters.year = filterData.year

    setSearchFilters(Object.keys(filters).length > 0 ? filters : undefined)
  }

  const handleClear = () => {
    setFilterData({
      vehicleCategory: '',
      vehicle: '',
      year: '',
    })
    setSearchFilters(undefined)
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Vehicle Report"
        withBreadCrumb
        breadCrumbData={breadcrumbData}
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
            col={3}
            className={bemClass([blk, 'margin-bottom'])}
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
            col={3}
            className={bemClass([blk, 'margin-bottom'])}
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
            col={3}
            className={bemClass([blk, 'margin-bottom'])}
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
            col={3}
            className={bemClass([blk, 'button-column'])}
          >
            <Button
              size="medium"
              clickHandler={handleSearch}
              disabled={!filterData.vehicleCategory || !filterData.vehicle || !filterData.year}
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
