import { FunctionComponent } from 'react'
import { bemClass, downloadFile, canEdit, canDelete } from '@utils'
import { useAuth } from '@contexts/AuthContext'

import './style.scss'
import { Anchor } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import { useAdvanceBookingsQuery, useDeleteAdvanceBookingMutation } from '@api/queries/advance-booking'

const blk = 'advance-booking-list'

interface Props {}

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (dateString: string | Date) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const AdvanceBookingList: FunctionComponent<Props> = () => {
  const { data: advanceBookingsResponse, isLoading } = useAdvanceBookingsQuery()
  const deleteAdvanceBookingMutation = useDeleteAdvanceBookingMutation()
  
  // Get permissions for Advance Bookings module
  const { permissions } = useAuth()
  const hasEditPermission = canEdit(permissions, 'Advance Bookings')
  const hasDeletePermission = canDelete(permissions, 'Advance Bookings')

  // Extract data from the response structure
  const advanceBookingsData = advanceBookingsResponse?.data || []

  const columns = [
    {
      label: 'Pickup Date',
      custom: ({ _id, pickUpDateTime }: { _id: string; pickUpDateTime: string }) => (
        <Anchor asLink href={`/advance-booking/${_id}/detail`}>
          {formatDate(pickUpDateTime)}
        </Anchor>
      ),
    },
    {
      label: 'Pickup Time',
      custom: ({ pickUpDateTime }: { pickUpDateTime: string }) => (
        <>{formatTime(pickUpDateTime)}</>
      ),
    },
    {
      label: 'Customer Type',
      custom: ({ customerType }: { customerType: string }) => (
        <>{customerType?.charAt(0).toUpperCase() + customerType?.slice(1) || '-'}</>
      ),
    },
    {
      label: 'Customer',
      custom: ({ customer, customerDetails }: { customer: any; customerDetails: any }) => {
        // For existing customers, show customer name if it's an object
        if (customer && typeof customer === 'object') {
          return customer.name || '-'
        }
        // For new customers, show customerDetails name
        if (customerDetails && typeof customerDetails === 'object') {
          return customerDetails.name || '-'
        }
        // Fallback
        return customer || customerDetails?.name || '-'
      },
    },
    {
      label: 'Pickup Location',
      map: 'pickUpLocation',
    },
    {
      label: 'Drop Location',
      map: 'dropOffLocation',
    },
    {
      label: 'Vehicle',
      map: 'vehicleType',
    },
    {
      label: 'AC',
      custom: ({ hasAc }: { hasAc: boolean }) => (
        <>{hasAc ? 'Yes' : 'No'}</>
      ),
    },
    {
      label: 'Status',
      map: 'status',
    },
  ]

  const handleDeleteAdvanceBooking = async (id: string) => {
    await deleteAdvanceBookingMutation.mutateAsync(id)
  }

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: {},
      }
      await downloadFile('/advanced-booking/export/excel', 'advance-bookings.xlsx', filters)
    } catch (error) {
      console.error('Excel export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleExportCsv = async () => {
    try {
      const filters = {
        filterData: {},
      }
      await downloadFile('/advanced-booking/export/csv', 'advance-bookings.csv', filters)
    } catch (error) {
      console.error('CSV export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleExportPdf = async () => {
    try {
      const filters = {
        filterData: {},
      }
      await downloadFile('/advanced-booking/export/pdf', 'advance-bookings.pdf', filters)
    } catch (error) {
      console.error('PDF export failed:', error)
      // You could add a toast notification here
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Advanced Bookings"
        total={advanceBookingsData.length}
        btnRoute={hasEditPermission ? "/advance-booking/create" : undefined}
        btnLabel={hasEditPermission ? "Add new Advanced Booking" : undefined}
        showExport
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={advanceBookingsData}
          isLoading={isLoading}
          deleteHandler={hasDeletePermission ? handleDeleteAdvanceBooking : undefined}
          editRoute={hasEditPermission ? "/advance-booking" : undefined}
        />
      </div>
    </div>
  )
}

export default AdvanceBookingList
