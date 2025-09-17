import { FunctionComponent } from 'react'
import { bemClass, formatDateValueForDisplay, formatMinutesToDuration } from '@utils'

import './style.scss'
import { Anchor } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import { useRegularRequestsQuery, useDeleteRegularRequestMutation } from '@api/queries/regular-request'

const blk = 'regular-requests-list'

interface Props {}

const RegularRequestsList: FunctionComponent<Props> = () => {
  const { data: requestsData, isLoading } = useRegularRequestsQuery()
  const deleteRegularRequestMutation = useDeleteRegularRequestMutation()

  // Extract data from the response structure
  const requests = requestsData?.data || []

  // Helper functions to get customer and vehicle names
  const getCustomerName = (request: any) => {
    if (request.customerType === 'existing' && request.customer?.name) {
      return request.customer.name
    } else if (request.customerType === 'new' && request.customerDetails) {
      return request.customerDetails.name || '-'
    }
    return '-'
  }

  const getVehicleName = (request: any) => {
    if (request.vehicleType === 'existing' && request.vehicle?.name) {
      return request.vehicle.name
    } else if (request.vehicleType === 'new' && request.vehicleDetails) {
      return request.vehicleDetails.name || '-'
    }
    return '-'
  }

  const columns = [
    {
      label: 'Request no.',
      custom: ({ _id, requestNo }: any) => (
        <Anchor asLink href={`/requests/regular/${_id}/detail`}>
          {requestNo || '-'}
        </Anchor>
      ),
    },
    {
      label: 'Customer',
      custom: (request: any) => (
        <>{getCustomerName(request)}</>
      ),
    },
    {
      label: 'Request type',
      custom: ({ requestType }: any) => (
        <>{requestType || '-'}</>
      ),
    },
    {
      label: 'Pickup date time',
      custom: ({ pickUpDateTime }: any) => (
        <>{formatDateValueForDisplay(pickUpDateTime)}</>
      ),
    },
    {
      label: 'Duration',
      custom: ({ totalHr }: any) => (
        <>{formatMinutesToDuration(totalHr)}</>
      ),
    },
    {
      label: 'Vehicle',
      custom: (request: any) => (
        <>{getVehicleName(request)}</>
      ),
    },
    {
      label: 'Request KM',
      custom: ({ totalKm }: any) => (
        <>{totalKm ? `${totalKm} km` : '-'}</>
      ),
    },
    {
      label: 'Total',
      custom: ({ requestTotal }: any) => (
        <>{requestTotal ? `₹${requestTotal.toLocaleString()}` : '-'}</>
      ),
    },
    {
      label: 'Invoice',
      custom: ({ customerBill }: any) => (
        <>{customerBill ? `₹${customerBill.toLocaleString()}` : '-'}</>
      ),
    },
  ]

  const handleDeleteRegularRequest = async (id: string) => {
    await deleteRegularRequestMutation.mutateAsync(id)
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Regular Requests"
        total={requests.length}
        btnRoute="/requests/regular/create"
        btnLabel="New Regular Request"
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={requests}
          isLoading={isLoading}
          deleteHandler={handleDeleteRegularRequest}
          editRoute="/requests/regular"
        />
      </div>
    </div>
  )
}

export default RegularRequestsList
