import { FunctionComponent } from 'react'
import { bemClass, pathToName } from '@utils'

import './style.scss'
import { Anchor } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import ActiveIndicator from '@components/active-indicator'
import { useCustomersQuery, useDeleteCustomerMutation } from '@api/queries/customer'
import { useConfigurationsQuery } from '@api/queries/configuration'

const blk = 'customers-list'

interface Props {
  category?: string
}

const CustomersList: FunctionComponent<Props> = ({ category = '' }) => {
  const { data: customersData = { data: [] }, isLoading } = useCustomersQuery()
  const { data: configurations } = useConfigurationsQuery()
  const deleteCustomerMutation = useDeleteCustomerMutation()

  // Filter customers by category if category is provided
  const filteredCustomersData = category 
    ? customersData.data?.filter((customer: any) => customer.category?.toLowerCase() === category?.toLowerCase()) || [] 
    : customersData.data || []

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

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={categoryName}
        total={filteredCustomersData.length}
        btnRoute={`/customers/${category}/create`}
        btnLabel={`Add ${categoryName}`}
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