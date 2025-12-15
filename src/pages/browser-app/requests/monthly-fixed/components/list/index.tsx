import { FunctionComponent, useState, useMemo, useEffect } from 'react'
import { bemClass, formatDateValueForDisplay, formatMinutesToDuration, nameToPath, downloadFile, canEdit, canDelete } from '@utils'
import { useAuth } from '@contexts/AuthContext'

import './style.scss'
import { Alert, Anchor, Button, Column, Row, SelectInput } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import { useFixedRequestsQuery, useDeleteFixedRequestMutation } from '@api/queries/fixed-request'
import { useVehicleByCategory } from '@api/queries/vehicle'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES, PAGINATION_TOTAL_ENTRIES_PER_PAGE } from '@config/constant'
import { Pagination } from '@components'

const blk = 'monthly-fixed-requests-list'

interface Props {}

const MonthlyFixedRequestsList: FunctionComponent<Props> = () => {
  // Get permissions for Monthly Fixed Requests module
  const { permissions } = useAuth()
  const hasEditPermission = canEdit(permissions, 'Monthly Fixed Requests')
  const hasDeletePermission = canDelete(permissions, 'Monthly Fixed Requests')
  
  const [filterData, setFilterData] = useState({
    vehicleCategory: '',
    vehicle: '',
  })

  const [searchFilters, setSearchFilters] = useState<Record<string, any> | undefined>(undefined)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  // Category path for API queries
  const vehicleCategoryPath = useMemo(() => {
    return filterData.vehicleCategory ? nameToPath(filterData.vehicleCategory) : ''
  }, [filterData.vehicleCategory])

  // API queries
  const { data: vehicles, error: vehiclesError, isLoading: vehiclesLoading, isError: vehiclesIsError } = useVehicleByCategory(vehicleCategoryPath)
  const { data: requestsData, isLoading } = useFixedRequestsQuery({
    ...searchFilters,
    page: currentPage,
    limit: entriesPerPage,
  })
  const deleteFixedRequestMutation = useDeleteFixedRequestMutation()

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
    handleApiResponse(vehicles, vehiclesError, vehiclesIsError, 'vehicles', setVehicleOptions, (vehicle: { _id: any; name: any }) => ({ key: vehicle._id, value: vehicle.name }))
  }, [vehicles, vehiclesError, vehiclesIsError])

  const getVehicleName = (request: any) => {
    // For regular/existing vehicleType, use assignmentDetails.vehicle
    if (request.vehicleDetails?.vehicleType === 'regular' && request.assignmentDetails?.vehicle?.name) {
      return request.assignmentDetails.vehicle.name
    } else if (request.vehicleDetails?.vehicleType === 'existing' && request.vehicleDetails?.vehicle?.name) {
      return request.vehicleDetails.vehicle.name
    } else if (request.vehicleDetails?.vehicleType === 'new' && request.vehicleDetails?.newVehicleDetails) {
      return request.vehicleDetails.newVehicleDetails.name || '-'
    }
    return '-'
  }

  const getVehicleProvided = (request: any) => {
    const vehicleType = request.vehicleDetails?.vehicleType
    if (vehicleType === 'regular') {
      return 'Regular'
    } else if (vehicleType === 'existing') {
      const category = request.vehicleDetails?.vehicleCategory
      if (category === 'own') return 'Own'
      if (category === 'supplier') return 'Supplier'
      return 'Existing'
    } else if (vehicleType === 'new') {
      return 'New'
    }
    return '-'
  }

  const columns = [
    {
      label: 'Request no.',
      custom: ({ _id, requestNo }: any) => (
        <Anchor
          asLink
          href={`/requests/monthly-fixed/${_id}/detail`}
        >
          {requestNo || '-'}
        </Anchor>
      ),
    },
    {
      label: 'Date',
      custom: ({ requestDetails }: any) => <>{formatDateValueForDisplay(requestDetails?.pickUpDateTime)}</>,
    },
    {
      label: 'Customer Name',
      custom: (request: any) => <>{request.customerDetails?.customer?.name || '-'}</>,
    },
    {
      label: 'Request type',
      custom: ({ requestDetails }: any) => <>{requestDetails?.requestType || '-'}</>,
    },
    {
      label: 'Vehicle provided',
      custom: (request: any) => <>{getVehicleProvided(request)}</>,
    },
    {
      label: 'Vehicle',
      custom: (request: any) => <>{getVehicleName(request)}</>,
    },
    {
      label: 'Total KM',
      custom: ({ requestDetails }: any) => <>{requestDetails?.totalKm ? `${requestDetails.totalKm} km` : '-'}</>,
    },
    {
      label: 'Total HR',
      custom: ({ requestDetails }: any) => <>{formatMinutesToDuration(requestDetails?.totalHr)}</>,
    },
    {
      label: 'Invoice',
      custom: ({ customerBill }: any) => <>{customerBill ? `₹${customerBill.toLocaleString()}` : '-'}</>,
    },
  ]

  const handleDeleteFixedRequest = async (id: string) => {
    await deleteFixedRequestMutation.mutateAsync(id)
  }

  const handleSearch = () => {
    const filters: Record<string, any> = {}
    if (filterData.vehicle) filters.vehicle = filterData.vehicle
    if (filterData.vehicleCategory) filters.vehicleCategory = nameToPath(filterData.vehicleCategory)
    setSearchFilters(Object.keys(filters).length > 0 ? filters : undefined)
  }

  const handleClear = () => {
    setFilterData({
      vehicleCategory: '',
      vehicle: '',
    })
    setSearchFilters(undefined)
    setCurrentPage(1) // Reset to first page when clearing
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesPerPageChange = (newEntriesPerPage: number) => {
    setEntriesPerPage(newEntriesPerPage)
  }

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: searchFilters,
      }
      await downloadFile('/fixed-request/export/excel', 'monthly-fixed-requests.xlsx', filters)
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
      await downloadFile('/fixed-request/export/csv', 'monthly-fixed-requests.csv', filters)
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
      await downloadFile('/fixed-request/export/pdf', 'monthly-fixed-requests.pdf', filters)
    } catch (error) {
      console.error('PDF export failed:', error)
      // You could add a toast notification here
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Monthly Fixed Requests"
        total={requestsData?.data.length}
        btnRoute={hasEditPermission ? "/requests/monthly-fixed/create" : undefined}
        btnLabel={hasEditPermission ? "New Monthly Fixed Request" : undefined}
        showExport
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
      />
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
            col={2}
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
            className={bemClass([blk, 'button-column'])}
          >
            <Button
              size="medium"
              clickHandler={handleSearch}
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
          data={requestsData?.data || []}
          isLoading={isLoading}
          deleteHandler={hasDeletePermission ? handleDeleteFixedRequest : undefined}
          editRoute={hasEditPermission ? "/requests/monthly-fixed" : undefined}
        />
      </div>
      <div className={bemClass([blk, 'pagination'])}>
        <Pagination
          currentPage={currentPage}
          totalPages={requestsData ? Math.ceil(requestsData.total / entriesPerPage) : 1}
          totalEntries={requestsData?.total || 0}
          entriesPerPage={entriesPerPage}
          onPageChange={handlePageChange}
          onEntriesPerPageChange={handleEntriesPerPageChange}
        />
      </div>
    </div>
  )
}

export default MonthlyFixedRequestsList
