import { FunctionComponent, useState } from 'react'
import { bemClass, pathToName, downloadFile, formatDateValueForDisplay } from '@utils'

import './style.scss'
import { Alert, Button, Column, Row, SelectInput, Modal, Text, Table, Anchor } from '@base'
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

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

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
    {
      label: 'Details',
      custom: (item: any) => (
        <Button
          size="small"
          clickHandler={() => {
            setSelectedPayment(item)
            setShowDetailsModal(true)
          }}
        >
          Details
        </Button>
      ),
    },
    {
      label: 'Payout',
      custom: (item: any) => (
        <Button
          size="small"
          category="success"
          clickHandler={() => handleDownloadPayout(item._id, item.staff?.name || 'staff')}
        >
          Download Payout
        </Button>
      ),
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

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: searchFilters,
      }
      await downloadFile('/staff-account/export/excel', `staff-payments-${filterData.month || 'all'}-${filterData.year || 'all'}.xlsx`, filters)
    } catch (error) {
      console.error('Excel export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleExportCsv = async () => {
    try {
      const filters = {
        filterData: searchFilters,
      }
      await downloadFile('/staff-account/export/csv', `staff-payments-${filterData.month || 'all'}-${filterData.year || 'all'}.csv`, filters)
    } catch (error) {
      console.error('CSV export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleExportPdf = async () => {
    try {
      const filters = {
        filterData: searchFilters,
      }
      await downloadFile('/staff-account/export/pdf', `staff-payments-${filterData.month || 'all'}-${filterData.year || 'all'}.pdf`, filters)
    } catch (error) {
      console.error('PDF export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleDownloadPayout = async (accountId: string, staffName: string) => {
    try {
      const payoutFilename = `payout-${staffName}-${filterData.month}-${filterData.year}.pdf`
      await downloadFile(`/staff-account/download/payout?id=${accountId}`, payoutFilename)
    } catch (error) {
      console.error('Failed to download payout:', error)
    }
  }

  const requestDetailColumns = [
    {
      label: 'Request ID',
      custom: ({ request, requestType }: any) => {
        const route = requestType === 'RegularRequest' 
          ? `/requests/regular/${request?._id}/detail`
          : `/requests/monthly-fixed/${request?._id}/detail`
        return (
          <Anchor
            asLink
            href={route}
          >
            {request?.requestNo || request?._id || '-'}
          </Anchor>
        )
      },
    },
    {
      label: 'Customer Name',
      custom: ({ request }: any) => <>{request?.customer?.name || '-'}</>,
    },
    {
      label: 'Pickup',
      custom: ({ request }: any) => <>{formatDateValueForDisplay(request?.pickUpDateTime)}</>,
    },
    {
      label: 'Drop',
      custom: ({ request }: any) => <>{formatDateValueForDisplay(request?.dropDateTime)}</>,
    },
    {
      label: 'Driver Allowance',
      custom: ({ driverAllowance }: any) => <>{`₹${driverAllowance || 0}`}</>,
    },
    {
      label: 'Night Halt',
      custom: ({ nightHalt }: any) => <>{`₹${nightHalt || 0}`}</>,
    },
  ]

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Staff Payments"
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

      <Modal
        show={showDetailsModal}
        closeHandler={() => setShowDetailsModal(false)}
      >
        <div className={bemClass([blk, 'modal-content'])}>
          <div className={bemClass([blk, 'modal-header'])}>
            <Text
              tag="h2"
              typography="l"
              fontWeight="bold"
              color="black"
            >
              Request details
            </Text>
          </div>
          <div className={bemClass([blk, 'modal-body'])}>
            <div className={bemClass([blk, 'table-container'])}>
              <Table
                columns={requestDetailColumns}
                data={selectedPayment?.requests || []}
                hoverEffect
              />
            </div>
          </div>
          <div className={bemClass([blk, 'modal-footer'])}>
            <Button clickHandler={() => setShowDetailsModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StaffPayments
