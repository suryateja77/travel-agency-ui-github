import { FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, pathToName, downloadFile } from '@utils'

import './style.scss'
import { Anchor, Currency } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import ActiveIndicator from '@components/active-indicator'
import { usePackagesQuery, usePackageByCategory, useDeletePackageMutation } from '@api/queries/package'
import { useConfigurationsQuery } from '@api/queries/configuration'

const blk = 'packages-list'

interface Props {
  category?: string
}

const PackagesList: FunctionComponent<Props> = ({ category = '' }) => {
  // Use category-specific query when category is provided, otherwise fetch all
  const { data: packageData, isLoading } = category 
    ? usePackageByCategory(category) 
    : usePackagesQuery()
  const { data: configurations } = useConfigurationsQuery()
  const deletePackageMutation = useDeletePackageMutation()

  // Extract data from the response structure
  const packagesData = packageData?.data || []

  // No need to filter since we're using category-specific query
  const filteredPackageData = packagesData

  // Get category name from configurations
  const getPackageCategoryName = () => {
    if (!category) return 'Packages'
    if (!configurations || !Array.isArray(configurations)) return pathToName(category)
    const packageConfig = configurations.find((config: any) => config.name === 'Package category')
    const categoryItem = packageConfig?.configurationItems?.find((item: any) => item.name.toLowerCase() === category?.toLowerCase())
    return categoryItem?.name || pathToName(category)
  }

  const categoryName = getPackageCategoryName()

  const columns = [
    {
      label: 'Package Code',
      custom: ({ _id, packageCode }: { _id: string; packageCode: string }) => (
        <Anchor asLink href={`/packages/${category}/${_id}/detail`}>
          {packageCode}
        </Anchor>
      ),
    },
    {
      label: 'Minimum Km',
      custom: ({ minimumKm }: { minimumKm: number }) => (
        <>{minimumKm || '-'}</>
      ),
    },
    {
      label: 'Minimum Hr',
      custom: ({ minimumHr }: { minimumHr: number }) => (
        <>{minimumHr || '-'}</>
      ),
    },
    {
      label: 'Base Amount',
      className: 'text-right',
      custom: ({ baseAmount }: { baseAmount: number }) => (
        <Currency data={baseAmount} />
      ),
    },
    {
      label: 'Extra Km Rate',
      className: 'text-right',
      custom: ({ extraKmPerKmRate }: { extraKmPerKmRate: number }) => (
        <Currency data={extraKmPerKmRate} />
      ),
    },
    {
      label: 'Extra Hr Rate',
      className: 'text-right',
      custom: ({ extraHrPerHrRate }: { extraHrPerHrRate: number }) => (
        <Currency data={extraHrPerHrRate} />
      ),
    },
    {
      label: 'Active',
      custom: ({ isActive }: { isActive: boolean }) => (
        <ActiveIndicator isActive={isActive} />
      ),
    },
  ]

  const handleDeletePackage = async (id: string) => {
    await deletePackageMutation.mutateAsync(id)
  }

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: category ? { category } : {},
      }
      await downloadFile('/package/export/excel', `packages-${category || 'all'}.xlsx`, filters)
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
      await downloadFile('/package/export/csv', `packages-${category || 'all'}.csv`, filters)
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
      await downloadFile('/package/export/pdf', `packages-${category || 'all'}.pdf`, filters)
    } catch (error) {
      console.error('PDF export failed:', error)
      // You could add a toast notification here
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={`${categoryName} Packages`}
        total={filteredPackageData.length}
        btnRoute={`/packages/${category}/create`}
        btnLabel={`Add ${categoryName} Package`}
        exportButtonsToShow={{ csv: true, pdf: true, excel: true }}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={filteredPackageData}
          isLoading={isLoading}
          deleteHandler={handleDeletePackage}
          editRoute={`/packages/${category}`}
          routeParams={{ category }}
          queryParams={{ category }}
        />
      </div>
    </div>
  )
}

export default PackagesList
