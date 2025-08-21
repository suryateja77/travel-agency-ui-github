import { FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, pathToName } from '@utils'

import './style.scss'
import { Anchor } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import ActiveIndicator from '@components/active-indicator'
import { useVehiclesQuery, useDeleteVehicleMutation } from '@api/queries/vehicle'
import { useConfigurationsQuery } from '@api/queries/configuration'

const blk = 'vehicles-list'

interface Props {
  category?: string
}

const VehiclesList: FunctionComponent<Props> = ({ category = '' }) => {
  const { data: vehicleData = { data: [] }, isLoading } = useVehiclesQuery()
  const { data: configurations } = useConfigurationsQuery()
  const deleteVehicleMutation = useDeleteVehicleMutation()

  // Filter vehicles by category if category is provided
  const filteredVehicleData = category 
    ? vehicleData.data?.filter((vehicle: any) => vehicle.category?.toLowerCase() === category?.toLowerCase()) || [] 
    : vehicleData.data || []

  // Get category name from configurations
  const getVehicleCategoryName = () => {
    if (!category) return 'Vehicles'
    if (!configurations || !Array.isArray(configurations)) return pathToName(category)
    const vehicleConfig = configurations.find((config: any) => config.name === 'Vehicle category')
    const categoryItem = vehicleConfig?.configurationItems?.find((item: any) => item.name.toLowerCase() === category?.toLowerCase())
    return categoryItem?.name || pathToName(category)
  }

  const categoryName = getVehicleCategoryName()

  const columns = [
    {
      label: 'Vehicle',
      custom: ({ _id, vehicleDetails }: { _id: string; vehicleDetails: any }) => (
        <Anchor asLink href={`/vehicles/${category}/${_id}/detail`}>
          {vehicleDetails?.name || '-'}
        </Anchor>
      ),
    },
    {
      label: 'Vehicle No',
      custom: ({ vehicleDetails }: { vehicleDetails: any }) => (
        <>{vehicleDetails?.registrationNumber || '-'}</>
      ),
    },
    {
      label: 'No of seats',
      custom: ({ vehicleDetails }: { vehicleDetails: any }) => (
        <>{vehicleDetails?.numberOfSeats || '-'}</>
      ),
    },
    {
      label: 'Type',
      custom: ({ vehicleDetails }: { vehicleDetails: any }) => (
        <>{vehicleDetails?.vehicleType || '-'}</>
      ),
    },
    {
      label: 'AC',
      custom: ({ vehicleDetails }: { vehicleDetails: any }) => (
        <>{vehicleDetails?.isACRequired ? 'Yes' : 'No'}</>
      ),
    },
    {
      label: 'Monthly Fixed',
      custom: ({ vehicleDetails }: { vehicleDetails: any }) => (
        <>{vehicleDetails?.isMonthlyFixed ? 'Yes' : 'No'}</>
      ),
    },
    {
      label: 'Active',
      custom: ({ isActive }: { isActive: boolean }) => (
        <ActiveIndicator isActive={isActive} />
      ),
    },
  ]

  const handleDeleteVehicle = async (id: string) => {
    await deleteVehicleMutation.mutateAsync(id)
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={`${categoryName} Vehicles`}
        total={filteredVehicleData.length}
        btnRoute={`/vehicles/${category}/create`}
        btnLabel={`Add ${categoryName} Vehicle`}
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={filteredVehicleData}
          isLoading={isLoading}
          deleteHandler={handleDeleteVehicle}
          editRoute={`/vehicles/${category}`}
          routeParams={{ category }}
          queryParams={{ category }}
        />
      </div>
    </div>
  )
}

export default VehiclesList
