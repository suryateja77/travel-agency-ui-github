import { FunctionComponent, useState } from 'react'
import { bemClass, pathToName } from '@utils'

import './style.scss'
import { Alert, Button, Column, Row, SelectInput } from '@base'
import PageHeader from '@components/page-header'
import EntityGrid from '@components/entity-grid'
import { useStaffAccountsQuery } from '@api/queries/staff-account'

const blk = 'staff-payments'

interface StaffPaymentsProps {}

const StaffPayments: FunctionComponent<StaffPaymentsProps> = () => {
  // Get current date for default filter values
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' })
  const currentYear = currentDate.getFullYear().toString()

  const [filterData, setFilterData] = useState({
    month: currentMonth,
    year: currentYear,
  })

  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({
    month: currentMonth,
    year: currentYear,
  })

  const yearOptions = [
    { key: '2024', value: '2024' },
    { key: '2025', value: '2025' },
  ]

  const monthOptions = [
    { key: 'Jan', value: 'Jan' },
    { key: 'Feb', value: 'Feb' },
    { key: 'Mar', value: 'Mar' },
    { key: 'Apr', value: 'Apr' },
    { key: 'May', value: 'May' },
    { key: 'Jun', value: 'Jun' },
    { key: 'Jul', value: 'Jul' },
    { key: 'Aug', value: 'Aug' },
    { key: 'Sep', value: 'Sep' },
    { key: 'Oct', value: 'Oct' },
    { key: 'Nov', value: 'Nov' },
    { key: 'Dec', value: 'Dec' },
  ]

  const breadcrumbData = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Staff Payments' },
  ]

  // API query for staff accounts data
  const { data: staffAccountsData, isLoading, error } = useStaffAccountsQuery(searchFilters)

  const columns = [
    {
      label: 'Staff Category',
      custom: ({ staffCategory }: any) => <>{pathToName(staffCategory) || '-'}</>,
    },
    {
      label: 'Staff',
      custom: ({ staff }: any) => <>{staff?.name || '-'}</>,
    },
    {
      label: 'Base Salary',
      custom: ({ staff }: any) => {
        const salary = staff?.salary
        return <>{salary !== undefined && salary !== null ? `₹${salary.toLocaleString()}` : '-'}</>
      },
    },
    {
      label: 'Other Charges',
      custom: ({ totalDriverAllowance, totalNightHalt }: any) => {
        const driverAllowance = totalDriverAllowance || 0
        const nightHalt = totalNightHalt || 0
        const total = driverAllowance + nightHalt
        return <>{`₹${total.toLocaleString()}`}</>
      },
    },
    {
      label: 'Advance Payment',
      custom: ({ advancePayment }: any) => {
        const advance = advancePayment || 0
        return <>{`₹${advance.toLocaleString()}`}</>
      },
    },
    {
      label: 'Final Payout',
      custom: ({ staff, totalDriverAllowance, totalNightHalt, advancePayment }: any) => {
        const salary = staff?.salary || 0
        const driverAllowance = totalDriverAllowance || 0
        const nightHalt = totalNightHalt || 0
        const advance = advancePayment || 0
        const finalPayout = salary + driverAllowance + nightHalt - advance
        return <>{`₹${finalPayout.toLocaleString()}`}</>
      },
    },
  ]

  const handleSearch = () => {
    const filters: Record<string, any> = {}
    if (filterData.month) filters.month = filterData.month
    if (filterData.year) filters.year = filterData.year

    setSearchFilters(filters)
  }

  const handleClear = () => {
    setFilterData({
      month: '',
      year: '',
    })
    setSearchFilters({})
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Staff Payments"
        withBreadCrumb
        breadCrumbData={breadcrumbData}
        exportButtonsToShow={{ csv: true, pdf: true, excel: true }}
      />
      {error && (
        <Alert
          type="error"
          message="Unable to load staff payments data. Please check your connection and try again."
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
              label="Month"
              name="month"
              options={monthOptions}
              value={filterData.month}
              changeHandler={value => {
                setFilterData(prev => ({
                  ...prev,
                  month: value.month?.toString() || '',
                }))
              }}
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
              disabled={!filterData.month || !filterData.year}
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
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={staffAccountsData?.data || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default StaffPayments
