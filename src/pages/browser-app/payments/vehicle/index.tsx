import React, { FunctionComponent, useState } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { Alert, Button, Column, Row, SelectInput } from '@base'
import PageHeader from '@components/page-header'
import EntityGrid from '@components/entity-grid'
import { useFixedVehiclePaymentsQuery } from '@api/queries/fixed-vehicle-payment'
import { downloadFile } from '@utils'

const blk = 'vehicle-payments'

interface VehiclePaymentsProps {}

const VehiclePayments: FunctionComponent<VehiclePaymentsProps> = () => {
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
    { label: 'Vehicle Payments' },
  ]

  // API query for fixed vehicle payments data
  const { data: vehiclePaymentsData, isLoading, error } = useFixedVehiclePaymentsQuery(searchFilters)

  const columns = [
    {
      label: 'Vehicle',
      custom: ({ vehicle }: any) => <>{vehicle?.registrationNo || '-'}</>,
    },
    {
      label: 'Local Requests',
      custom: ({ totalLocalRequests }: any) => <>{totalLocalRequests || 0}</>,
    },
    {
      label: 'Out Station Requests',
      custom: ({ totalOutStationRequests }: any) => <>{totalOutStationRequests || 0}</>,
    },
    {
      label: 'Total KM',
      custom: ({ totalKm }: any) => <>{totalKm || 0}</>,
    },
    {
      label: 'Total Extra KM',
      custom: ({ requestPackage, totalKm }: any) => {
        if (!requestPackage?.minimumKm || !totalKm) return <>0</>
        const extraKm = requestPackage.minimumKm - totalKm
        return <>{extraKm > 0 ? extraKm : 0}</>
      },
    },
    {
      label: 'Total HR',
      custom: ({ totalHr }: any) => <>{totalHr || 0}</>,
    },
    {
      label: 'Total Extra HR',
      custom: ({ totalExtraHr }: any) => <>{totalExtraHr || 0}</>,
    },
    {
      label: 'Other Charges',
      custom: ({ totalToll, totalParking, totalNightHalt, totalDriverAllowance }: any) => {
        const totalOtherCharges = (totalToll || 0) + (totalParking || 0) + (totalNightHalt || 0) + (totalDriverAllowance || 0)
        return <>{`₹${totalOtherCharges.toLocaleString()}`}</>
      },
    },
    {
      label: 'Total',
      custom: ({ requestPackage, totalKm, totalExtraHr, totalToll, totalParking, totalNightHalt, totalDriverAllowance }: any) => {
        if (!requestPackage) return <>₹0</>

        const {
          baseAmount, minimumKm, extraKmPerKmRate, extraHrPerHrRate,
        } = requestPackage

        const extraKm = minimumKm - (totalKm || 0)
        const extraKmAmount = extraKm > 0 ? extraKm * extraKmPerKmRate : 0
        const extraHrAmount = (totalExtraHr || 0) * extraHrPerHrRate
        const totalOtherCharges = (totalToll || 0) + (totalParking || 0) + (totalNightHalt || 0) + (totalDriverAllowance || 0)
        const totalAmount = baseAmount + extraKmAmount + extraHrAmount + totalOtherCharges

        return <>{`₹${totalAmount.toLocaleString()}`}</>
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

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: searchFilters,
      }
      await downloadFile('/fixed-vehicle-payment/export/excel', `vehicle-payments-${filterData.month || 'all'}-${filterData.year || 'all'}.xlsx`, filters)
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
      await downloadFile('/fixed-vehicle-payment/export/csv', `vehicle-payments-${filterData.month || 'all'}-${filterData.year || 'all'}.csv`, filters)
    } catch (error) {
      console.error('CSV export failed:', error)
      // You could add a toast notification here
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Vehicle Payments"
        withBreadCrumb
        breadCrumbData={breadcrumbData}
        exportButtonsToShow={{ csv: true, pdf: true, excel: true }}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
      />
      {error && (
        <Alert
          type="error"
          message="Unable to load vehicle payments data. Please check your connection and try again."
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
          data={vehiclePaymentsData?.data || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default VehiclePayments
