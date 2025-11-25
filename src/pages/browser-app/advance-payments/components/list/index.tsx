import { FunctionComponent } from 'react'
import { bemClass, downloadFile } from '@utils'

import './style.scss'
import { Anchor } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import { useAdvancedPaymentsQuery, useDeleteAdvancePaymentMutation } from '@api/queries/advanced-payment'

const blk = 'advance-payments-list'

interface Props {}

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatAmount = (amount: number) => {
  if (!amount) return '₹0'
  return `₹${amount.toLocaleString('en-IN')}`
}

const AdvancePaymentList: FunctionComponent<Props> = () => {
  const { data: advancePaymentsResponse, isLoading } = useAdvancedPaymentsQuery()
  const deleteAdvancePaymentMutation = useDeleteAdvancePaymentMutation()

  // Extract data from the response structure
  const advancePaymentsData = advancePaymentsResponse?.data || []

  const columns = [
    {
      label: 'Staff Name',
      custom: ({ staff }: { staff: any }) => {
        // Handle both string and object types for staff
        if (typeof staff === 'object' && staff?.name) {
          return staff.name
        }
        return staff || '-'
      },
    },
    {
      label: 'Payment Date',
      custom: ({ paymentDate, _id }: { paymentDate: string; _id: string }) => (
        <Anchor asLink href={`/advance-payments/${_id}/detail`}>
          {formatDate(paymentDate)}
        </Anchor>
      ),
    },
    {
      label: 'Payment Method',
      map: 'paymentMethod',
    },
    {
      label: 'Amount',
      custom: ({ amount }: { amount: number }) => (
        <>{formatAmount(amount)}</>
      ),
    },
  ]

  const handleDeleteAdvancePayment = async (id: string) => {
    await deleteAdvancePaymentMutation.mutateAsync(id)
  }

  const handleExportExcel = async () => {
    try {
      const filters = {
        filterData: {},
      }
      await downloadFile('/advanced-payment/export/excel', 'advance-payments.xlsx', filters)
    } catch (error) {
      console.error('Excel export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleExportCsv = async () => {
    try {
      const filters = {
        filterData: {},
      }
      await downloadFile('/advanced-payment/export/csv', 'advance-payments.csv', filters)
    } catch (error) {
      console.error('CSV export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleExportPdf = async () => {
    try {
      const filters = {
        filterData: {},
      }
      await downloadFile('/advanced-payment/export/pdf', 'advance-payments.pdf', filters)
    } catch (error) {
      console.error('PDF export failed:', error)
      // You could add a toast notification here
    }
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="Advance Payments"
        total={advancePaymentsData.length}
        btnRoute="/advance-payments/create"
        btnLabel="Add new Advance Payment"
        showExport
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={advancePaymentsData}
          isLoading={isLoading}
          deleteHandler={handleDeleteAdvancePayment}
          editRoute="/advance-payments"
        />
      </div>
    </div>
  )
}

export default AdvancePaymentList
