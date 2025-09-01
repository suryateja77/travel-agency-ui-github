import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatDateValueForDisplay } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { advancePaymentDetailsFields } from './model'
import { AdvancePaymentModel, INITIAL_ADVANCE_PAYMENT, Panel } from '@types'
import PageDetail from '@base/page-detail'
import { useAdvancePaymentByIdQuery } from '@api/queries/advanced-payment'

const blk = 'advance-payment-detail'

interface AdvancePaymentDetailProps {}

interface TransformedAdvancePaymentData extends Record<string, any> {
  staffCategory: string
  staff: { name: string } | string
  paymentDate: string
  paymentMethod: string
  amount: string
  comment: string
}

// Transform the advance payment data to handle object references and formatting
const transformAdvancePaymentData = (data: AdvancePaymentModel): TransformedAdvancePaymentData => {
  return {
    ...data,
    paymentDate: formatDateValueForDisplay(data.paymentDate),
    amount: data.amount?.toString() || '-',
    comment: data.comment || '-',
    // Transform staff object reference for nested path access
    staff: (() => {
      const staff = data.staff
      if (!staff) return '-'
      // If it's already an object, return it as is for nested path access
      if (typeof staff === 'object' && 'name' in staff) {
        return staff
      }
      // If it's a string, create an object structure for consistency
      return { name: staff.toString() }
    })(),
  }
}

// No conditional filtering needed for advance payment - all panels always show
const createFilteredTemplate = (originalTemplate: Panel[], data: AdvancePaymentModel): Panel[] => {
  return originalTemplate
}

const AdvancePaymentDetail: FunctionComponent<AdvancePaymentDetailProps> = () => {
  const params = useParams()

  const { data: currentAdvancePaymentData, isLoading, error } = useAdvancePaymentByIdQuery(params.id || '')
  const [advancePaymentData, setAdvancePaymentData] = useState<TransformedAdvancePaymentData | null>(null)

  // Memoize the filtered template (no filtering needed for advance payment)
  const filteredTemplate = useMemo(() => {
    if (!currentAdvancePaymentData) {
      return advancePaymentDetailsFields
    }
    return createFilteredTemplate(advancePaymentDetailsFields, currentAdvancePaymentData)
  }, [currentAdvancePaymentData])

  useEffect(() => {
    if (currentAdvancePaymentData) {
      const transformedData = transformAdvancePaymentData(currentAdvancePaymentData)
      setAdvancePaymentData(transformedData)
    }
  }, [currentAdvancePaymentData])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          Advance Payment Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : error ? (
          <Alert
            type="error"
            message="Unable to get the advance payment details, please try later"
          />
        ) : (
          <PageDetail
            pageData={advancePaymentData || INITIAL_ADVANCE_PAYMENT}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default AdvancePaymentDetail
