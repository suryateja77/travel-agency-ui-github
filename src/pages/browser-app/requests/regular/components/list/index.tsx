import { FunctionComponent, useState, useMemo, useEffect } from 'react'
import { bemClass, formatDateValueForDisplay, formatMinutesToDuration, nameToPath } from '@utils'

import './style.scss'
import { Alert, Anchor, Button, Column, Row, SelectInput } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import { useRegularRequestsQuery, useDeleteRegularRequestMutation } from '@api/queries/regular-request'
import { useVehicleByCategory } from '@api/queries/vehicle'
import ConfiguredInput from '@base/configured-input'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

const blk = 'regular-requests-list'

interface Props {}

const RegularRequestsList: FunctionComponent<Props> = () => {
  const [filterData, setFilterData] = useState({
    vehicleCategory: '',
    vehicle: '',
  })

  const [searchFilters, setSearchFilters] = useState<Record<string, any> | undefined>(undefined)

  // Category path for API queries
  const vehicleCategoryPath = useMemo(() => {
    return filterData.vehicleCategory ? nameToPath(filterData.vehicleCategory) : ''
  }, [filterData.vehicleCategory])

  // API queries
  const { data: vehicles, error: vehiclesError, isLoading: vehiclesLoading, isError: vehiclesIsError } = useVehicleByCategory(vehicleCategoryPath)
  const { data: requestsData, isLoading } = useRegularRequestsQuery(searchFilters)
  const deleteRegularRequestMutation = useDeleteRegularRequestMutation()

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
        <Anchor
          asLink
          href={`/requests/regular/${_id}/detail`}
        >
          {requestNo || '-'}
        </Anchor>
      ),
    },
    {
      label: 'Customer',
      custom: (request: any) => <>{getCustomerName(request)}</>,
    },
    {
      label: 'Request type',
      custom: ({ requestType }: any) => <>{requestType || '-'}</>,
    },
    {
      label: 'Pickup date time',
      custom: ({ pickUpDateTime }: any) => <>{formatDateValueForDisplay(pickUpDateTime)}</>,
    },
    {
      label: 'Duration',
      custom: ({ totalHr }: any) => <>{formatMinutesToDuration(totalHr)}</>,
    },
    {
      label: 'Vehicle',
      custom: (request: any) => <>{getVehicleName(request)}</>,
    },
    {
      label: 'Request KM',
      custom: ({ totalKm }: any) => <>{totalKm ? `${totalKm} km` : '-'}</>,
    },
    {
      label: 'Total',
      custom: ({ requestTotal }: any) => <>{requestTotal ? `₹${requestTotal.toLocaleString()}` : '-'}</>,
    },
    {
      label: 'Invoice',
      custom: ({ customerBill }: any) => <>{customerBill ? `₹${customerBill.toLocaleString()}` : '-'}</>,
    },
  ]

  const handleDeleteRegularRequest = async (id: string) => {
    await deleteRegularRequestMutation.mutateAsync(id)
  }

  const handleSearch = () => {
    const filters: Record<string, any> = {}
    if (filterData.vehicle) filters.vehicle = filterData.vehicle
    if (filterData.vehicleCategory) filters.vehicleCategory = filterData.vehicleCategory
    
    setSearchFilters(Object.keys(filters).length > 0 ? filters : undefined)
  }

  const handleClear = () => {
    setFilterData({
      vehicleCategory: '',
      vehicle: '',
    })
    setSearchFilters(undefined)
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Regular Requests"
        total={requests.length}
        btnRoute="/requests/regular/create"
        btnLabel="New Regular Request"
      />
      {(apiErrors.vehicles) && (
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
