import { FunctionComponent, useEffect } from 'react'
import { bemClass } from '@utils'

import './style.scss'
import { Anchor } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import { useSuppliersQuery, useDeleteSupplierMutation } from '@api/queries/supplier'

const blk = 'suppliers-list'

interface Props {}

const SupplierList: FunctionComponent<Props> = () => {
  const { data: suppliersResponse, isLoading } = useSuppliersQuery()
  const deleteSupplierMutation = useDeleteSupplierMutation()

  // Extract data from the response structure
  const suppliersData = suppliersResponse?.data || []

  const columns = [
    {
      label: 'Company Name',
      custom: ({ companyName, _id }: { companyName: string; _id: string }) => (
        <Anchor
          asLink
          href={`/suppliers/${_id}/detail`}
        >
          {companyName || '-'}
        </Anchor>
      ),
    },
    {
      label: 'Contact',
      map: 'contact',
    },
    {
      label: 'Email',
      custom: ({ email }: { email: string }) => <>{email || '-'}</>,
    },
    {
      label: 'Point of Contact',
      custom: ({ pointOfContact }: { pointOfContact: any }) => {
        // Handle both string and object types for pointOfContact
        if (typeof pointOfContact === 'object' && pointOfContact?.name) {
          return pointOfContact.name
        }
        return pointOfContact || '-'
      },
    },
    {
      label: 'Status',
      custom: ({ isActive }: { isActive: boolean }) => <>{isActive ? 'Active' : 'Inactive'}</>,
    },
  ]

  const handleDeleteSupplier = async (id: string) => {
    await deleteSupplierMutation.mutateAsync(id)
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Suppliers"
        total={suppliersData.length}
        btnRoute="/suppliers/create"
        btnLabel="Add new Supplier"
        exportButtonsToShow={{ csv: true, pdf: true, excel: true }}
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={suppliersData}
          isLoading={isLoading}
          deleteHandler={handleDeleteSupplier}
          editRoute="/suppliers"
        />
      </div>
    </div>
  )
}

export default SupplierList
