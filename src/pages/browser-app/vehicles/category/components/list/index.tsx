import { FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, pathToName, downloadFile } from '@utils'

import './style.scss'
import { Anchor } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import ActiveIndicator from '@components/active-indicator'
import { useVehiclesQuery, useVehicleByCategory, useDeleteVehicleMutation } from '@api/queries/vehicle'
import { useConfigurationsQuery } from '@api/queries/configuration'

const blk = 'vehicles-list'

interface Props {
  category?: string
}

const VehiclesList: FunctionComponent<Props> = ({ category = '' }) => {
  // Use category-specific query when category is provided, otherwise fetch all
  const { data: vehicleData, isLoading } = category 
    ? useVehicleByCategory(category) 
    : useVehiclesQuery()
  const { data: configurations } = useConfigurationsQuery()
  const deleteVehicleMutation = useDeleteVehicleMutation()

  // Extract data from the response structure
  const vehiclesData = vehicleData?.data || []

  // No need to filter since we're using category-specific query
  const filteredVehicleData = vehiclesData

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
      custom: ({ _id, name }: { _id: string; name: any }) => (
        <Anchor asLink href={`/vehicles/${category}/${_id}/detail`}>
          {name || '-'}
        </Anchor>
      ),
    },
    {
      label: 'Vehicle No',
      custom: ({ registrationNo }: { registrationNo: any }) => (
        <>{registrationNo || '-'}</>
      ),
    },
    {
      label: 'No of seats',
      custom: ({ noOfSeats }: { noOfSeats: any }) => (
        <>{noOfSeats || '-'}</>
      ),
    },
    {
      label: 'Type',
      custom: ({ type }: { type: any }) => (
        <>{type || '-'}</>
      ),
    },
    {
      label: 'AC',
      custom: ({ hasAc }: { hasAc: any }) => (
        <>{hasAc ? 'Yes' : 'No'}</>
      ),
    },
    {
      label: 'Monthly Fixed',
      custom: ({ isMonthlyFixed }: { isMonthlyFixed: any }) => (
        <>{isMonthlyFixed ? 'Yes' : 'No'}</>
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

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: category ? { category } : {},
      }
      await downloadFile('/vehicle/export/excel', `vehicles-${category || 'all'}.xlsx`, filters)
    } catch (error) {
      console.error('Excel export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleExportCsv = async () => {
    try {
      const filters = {
        filterData: category ? { category } : {},
      }
      await downloadFile('/vehicle/export/csv', `vehicles-${category || 'all'}.csv`, filters)
    } catch (error) {
      console.error('CSV export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleExportPdf = async () => {
    try {
      const filters = {
        filterData: category ? { category } : {},
      }
      await downloadFile('/vehicle/export/pdf', `vehicles-${category || 'all'}.pdf`, filters)
    } catch (error) {
      console.error('PDF export failed:', error)
      // You could add a toast notification here
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={`${categoryName} Vehicles`}
        total={filteredVehicleData.length}
        btnRoute={`/vehicles/${category}/create`}
        btnLabel={`Add ${categoryName} Vehicle`}
        exportButtonsToShow={{
          csv: true,
          pdf: true,
          excel: true,
        }}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={filteredVehicleData || []}
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
