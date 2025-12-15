import React, { FunctionComponent, useState } from 'react'
import { bemClass, formatDateValueForDisplay, downloadFile } from '@utils'
import { useToast } from '@contexts/ToastContext'

import './style.scss'
import { Alert, Button, Column, Row, SelectInput, Modal, Anchor, Text, Table } from '@base'
import PageHeader from '@components/page-header'
import EntityGrid from '@components/entity-grid'
import { useSupplierPaymentsQuery } from '@api/queries/supplierPayment'

const blk = 'supplier-payments'

interface SupplierPaymentsProps {}

const SupplierPayments: FunctionComponent<SupplierPaymentsProps> = () => {
  const { showToast } = useToast()
  
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
    { key: '2026', value: '2026' },
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

  const breadcrumbData = [{ label: 'Home', route: '/dashboard' }, { label: 'Supplier Payments' }]

  // API query for supplier payments data
  const { data: supplierPaymentsData, isLoading, error } = useSupplierPaymentsQuery(searchFilters)

  const columns = [
    {
      label: 'Supplier',
      custom: ({ supplier }: any) => <>{supplier?.companyName || '-'}</>,
    },
    {
      label: 'Vehicle',
      custom: ({ vehicle }: any) => <>{vehicle?.registrationNo || '-'}</>,
    },
    {
      label: 'Total KM',
      custom: ({ totalKm }: any) => <>{totalKm || 0}</>,
    },
    {
      label: 'Total HR',
      custom: ({ totalHr }: any) => <>{totalHr || 0}</>,
    },
    {
      label: 'Extra KM',
      custom: ({ totalExtraKm }: any) => <>{totalExtraKm || 0}</>,
    },
    {
      label: 'Extra HR',
      custom: ({ totalExtraHr }: any) => <>{totalExtraHr || 0}</>,
    },
    {
      label: 'Total Amount',
      custom: ({ totalAmount }: any) => {
        return <>{`₹${(totalAmount || 0).toLocaleString()}`}</>
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
      await downloadFile('/supplier-payment/export/excel', `supplier-payments-${filterData.month || 'all'}-${filterData.year || 'all'}.xlsx`, filters)
      showToast('Excel file downloaded successfully', 'success')
    } catch (error) {
      console.error('Excel export failed:', error)
      showToast('Failed to download Excel file. Please try again.', 'error')
    }
  }

  const handleExportCsv = async () => {
    try {
      const filters = {
        filterData: searchFilters,
      }
      await downloadFile('/supplier-payment/export/csv', `supplier-payments-${filterData.month || 'all'}-${filterData.year || 'all'}.csv`, filters)
      showToast('CSV file downloaded successfully', 'success')
    } catch (error) {
      console.error('CSV export failed:', error)
      showToast('Failed to download CSV file. Please try again.', 'error')
    }
  }

  const handleExportPdf = async () => {
    try {
      const filters = {
        filterData: searchFilters,
      }
      await downloadFile('/supplier-payment/export/pdf', `supplier-payments-${filterData.month || 'all'}-${filterData.year || 'all'}.pdf`, filters)
      showToast('PDF file downloaded successfully', 'success')
    } catch (error) {
      console.error('PDF export failed:', error)
      showToast('Failed to download PDF file. Please try again.', 'error')
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
      custom: ({ request }: any) => {
        const customerName = request?.customerDetails?.customer?.name || request?.customerDetails?.newCustomerDetails?.name
        return <>{customerName || '-'}</>
      },
    },
    {
      label: 'Pickup',
      custom: ({ request }: any) => <>{request?.requestDetails?.pickUpLocation || '-'}</>,
    },
    {
      label: 'Drop',
      custom: ({ request }: any) => <>{request?.requestDetails?.dropOffLocation || '-'}</>,
    },
    {
      label: 'Package',
      custom: ({ package: pkg }: any) => <>{pkg?.packageCode || '-'}</>,
    },
    {
      label: 'Total Km',
      custom: ({ totalKm }: any) => <>{totalKm || 0}</>,
    },
    {
      label: 'Total Hr',
      custom: ({ totalHr }: any) => <>{totalHr || 0}</>,
    },
    {
      label: 'Extra Km',
      custom: ({ extraKm }: any) => <>{extraKm || 0}</>,
    },
    {
      label: 'Extra Hr',
      custom: ({ extraHr }: any) => <>{extraHr || 0}</>,
    },
    {
      label: 'Amount',
      custom: ({ amount }: any) => <>{`₹${(amount || 0).toLocaleString()}`}</>,
    },
  ]

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Supplier Payments"
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
          message="Unable to load supplier payments data. Please check your connection and try again."
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}
      <div className={bemClass([blk, 'filter-section'])}>
        <Row>
          <Column
            col={2}
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
          data={supplierPaymentsData?.data || []}
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

export default SupplierPayments
