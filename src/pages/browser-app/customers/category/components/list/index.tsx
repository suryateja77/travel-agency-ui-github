import { FunctionComponent } from 'react'
import { bemClass, pathToName, downloadFile } from '@utils'

import './style.scss'
import { Anchor } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import ActiveIndicator from '@components/active-indicator'
import { useCustomersQuery, useCustomerByCategory, useDeleteCustomerMutation } from '@api/queries/customer'
import { useConfigurationsQuery } from '@api/queries/configuration'

const blk = 'customers-list'

interface Props {
  category?: string
}

const CustomersList: FunctionComponent<Props> = ({ category = '' }) => {
  // Use category-specific query when category is provided, otherwise fetch all
  const { data: customersData, isLoading } = category 
    ? useCustomerByCategory(category) 
    : useCustomersQuery()
  const { data: configurations } = useConfigurationsQuery()
  const deleteCustomerMutation = useDeleteCustomerMutation()

  // Extract data from the response structure
  const customersList = customersData?.data || []

  // No need to filter since we're using category-specific query
  const filteredCustomersData = customersList

  // Get category name from configurations
  const getCustomerCategoryName = () => {
    if (!category) return 'Customers'
    if (!configurations || !Array.isArray(configurations)) return pathToName(category)
    const customerConfig = configurations.find((config: any) => config.name === 'Customer category')
    const categoryItem = customerConfig?.configurationItems?.find((item: any) => item.name.toLowerCase() === category?.toLowerCase())
    return categoryItem?.name || pathToName(category)
  }

  const categoryName = getCustomerCategoryName()

  const columns = [
    {
      label: 'Name',
      custom: ({ _id, name }: { _id: string; name: string }) => (
        <Anchor asLink href={`/customers/${category}/${_id}/detail`}>
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
      label: 'Contact',
      custom: ({ contact }: { contact: string }) => (
        <>{`+91 ${contact}`}</>
      ),
    },
    {
      label: 'WhatsApp',
      custom: ({ whatsAppNumber }: { whatsAppNumber: string }) => (
        <>{`+91 ${whatsAppNumber}`}</>
      ),
    },
    {
      label: 'Email',
      map: 'email',
    },
    {
      label: 'Active',
      custom: ({ isActive }: { isActive: boolean }) => (
        <ActiveIndicator isActive={isActive} />
      ),
    },
  ]

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomerMutation.mutateAsync(id)
  }

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: category ? { category } : {},
      }
      await downloadFile('/customer/export/excel', `customers-${category || 'all'}.xlsx`, filters)
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
      await downloadFile('/customer/export/csv', `customers-${category || 'all'}.csv`, filters)
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
      await downloadFile('/customer/export/pdf', `customers-${category || 'all'}.pdf`, filters)
    } catch (error) {
      console.error('PDF export failed:', error)
      // You could add a toast notification here
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={`${categoryName} Customers`}
        total={filteredCustomersData.length}
        btnRoute={`/customers/${category}/create`}
        btnLabel={`Add ${categoryName} Customer`}
        showExport
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={filteredCustomersData}
          isLoading={isLoading}
          deleteHandler={handleDeleteCustomer}
          editRoute={`/customers/${category}`}
          routeParams={{ category }}
          queryParams={{ category }}
        />
      </div>
    </div>
  )
}

export default CustomersList