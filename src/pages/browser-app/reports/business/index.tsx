import { FunctionComponent, useState, useMemo } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { Alert, Button, Column, Row, SelectInput, Panel, ReadOnlyText } from '@base'
import PageHeader from '@components/page-header'
import EntityGrid from '@components/entity-grid'
import { useReportsQuery } from '@api/queries/report'

const blk = 'business-report'

interface BusinessReportProps {}

const BusinessReport: FunctionComponent<BusinessReportProps> = () => {
  const [filterData, setFilterData] = useState({
    year: '',
  })

  const [searchFilters, setSearchFilters] = useState<Record<string, any> | undefined>(undefined)

  const yearOptions = [
    { key: '2024', value: '2024' },
    { key: '2025', value: '2025' },
  ]

  const breadcrumbData = [{ label: 'Home', route: '/dashboard' }, { label: 'Business Report' }]

  // API query for reports data
  const { data: reportsData, isLoading, error } = useReportsQuery(searchFilters)

  const columns = [
    {
      label: 'Month',
      custom: ({ month }: any) => <>{month && month !== 'null' ? month : '-'}</>,
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
        totalProfit += numIncome - numExpense
      } else if (hasIncome) {
        totalProfit += numIncome
      } else if (hasExpense) {
        totalProfit += -numExpense
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
    if (filterData.year) filters.year = filterData.year

    setSearchFilters(Object.keys(filters).length > 0 ? filters : undefined)
  }

  const handleClear = () => {
    setFilterData({
      year: '',
    })
    setSearchFilters(undefined)
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Business Report"
        withBreadCrumb
        breadCrumbData={breadcrumbData}
      />
      {error && (
        <Alert
          type="error"
          message="Unable to load business report data. Please check your connection and try again."
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      <div className={bemClass([blk, 'filter-section'])}>
        <Row>
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
              disabled={!filterData.year}
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

export default BusinessReport
