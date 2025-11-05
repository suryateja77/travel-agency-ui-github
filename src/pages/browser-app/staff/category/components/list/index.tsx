import { FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, pathToName, downloadFile } from '@utils'

import './style.scss'
import { Anchor, Currency } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import ActiveIndicator from '@components/active-indicator'
import { useStaffsQuery, useStaffByCategory, useDeleteStaffMutation } from '@api/queries/staff'
import { useConfigurationsQuery } from '@api/queries/configuration'

const blk = 'staff-list'

interface Props {
  category?: string
}

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}


const StaffList: FunctionComponent<Props> = ({ category = '' }) => {
  // Use category-specific query when category is provided, otherwise fetch all
  const { data: staffData, isLoading } = category 
    ? useStaffByCategory(category) 
    : useStaffsQuery()
  const { data: configurations } = useConfigurationsQuery()
  const deleteStaffMutation = useDeleteStaffMutation()

  // Extract data from the response structure
  const staffsData = staffData?.data || []

  // No need to filter since we're using category-specific query
  const filteredStaffData = staffsData

  // Get category name from configurations
  const getStaffCategoryName = () => {
    if (!category) return 'Staff'
    if (!configurations || !Array.isArray(configurations)) return pathToName(category)
    const staffConfig = configurations.find((config: any) => config.name === 'Staff category')
    const categoryItem = staffConfig?.configurationItems?.find((item: any) => item.name.toLowerCase() === category?.toLowerCase())
    return categoryItem?.name || pathToName(category)
  }

  const categoryName = getStaffCategoryName()

  const columns = [
    {
      label: 'Name',
      custom: ({ _id, name }: { _id: string; name: string }) => (
        <Anchor asLink href={`/staff/${category}/${_id}/detail`}>
          {name}
        </Anchor>
      ),
    },
    {
      label: 'Address',
      custom: ({ address }: { address: any }) => {
        if (!address) return '-'
        const { addressLine1, addressLine2, city, state, pinCode } = address
        return `${addressLine1}, ${addressLine2}, ${city}, ${state}, ${pinCode}`
      },
    },
    {
      label: 'License',
      map: 'license',
    },
    {
      label: 'Contact',
      custom: ({ contact }: { contact: string }) => (
        <>{`+91 ${contact}`}</>
      ),
    },
    {
      label: 'Joining Date',
      custom: ({ joiningDate }: { joiningDate: string }) => (
        <>{formatDate(joiningDate)}</>
      ),
    },
    {
      label: 'Salary',
      className: 'text-right',
      custom: ({ salary }: { salary: number | string }) => (
        <Currency data={salary} />
      ),
    },
    {
      label: 'Active',
      custom: ({ isActive }: { isActive: boolean }) => (
        <ActiveIndicator isActive={isActive} />
      ),
    },
  ]

  const handleDeleteStaff = async (id: string) => {
    await deleteStaffMutation.mutateAsync(id)
  }

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: category ? { category } : {},
      }
      await downloadFile('/staff/export/excel', `staff-${category || 'all'}.xlsx`, filters)
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
      await downloadFile('/staff/export/csv', `staff-${category || 'all'}.csv`, filters)
    } catch (error) {
      console.error('CSV export failed:', error)
      // You could add a toast notification here
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={`${categoryName} Staff`}
        total={filteredStaffData.length}
        btnRoute={`/staff/${category}/create`}
        btnLabel={`Add new ${categoryName}`}
        exportButtonsToShow={{ csv: true, pdf: true, excel: true }}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={filteredStaffData}
          isLoading={isLoading}
          deleteHandler={handleDeleteStaff}
          editRoute={`/staff/${category}`}
          routeParams={{ category }}
          queryParams={{ category }}
        />
      </div>
    </div>
  )
}

export default StaffList