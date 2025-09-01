import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatBooleanValueForDisplay } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { customerDetailsFields } from './model'
import { CustomerModel, INITIAL_CUSTOMER, Panel } from '@types'
import PageDetail from '@base/page-detail'
import { useCustomerByIdQuery } from '@api/queries/customer'

const blk = 'customer-detail'

interface CustomerDetailProps {}

interface TransformedCustomerData extends Record<string, any> {
  name: string
  contact: string
  whatsAppNumber: string
  email: string
  address: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pinCode: string
  }
  isActive: string
  comment: string
  category: string
}

// Transform the customer data to handle formatting
const transformCustomerData = (data: CustomerModel): TransformedCustomerData => {
  return {
    ...data,
    email: data.email || '-',
    comment: data.comment || '-',
    isActive: formatBooleanValueForDisplay(data.isActive),
    // Preserve address object structure for nested path access
    address: {
      addressLine1: data.address?.addressLine1 || '-',
      addressLine2: data.address?.addressLine2 || '-',
      city: data.address?.city || '-',
      state: data.address?.state || '-',
      pinCode: data.address?.pinCode || '-',
    },
  }
}

// No conditional filtering needed for customer - all panels always show
const createFilteredTemplate = (originalTemplate: Panel[], data: CustomerModel): Panel[] => {
  return originalTemplate
}

const CustomerDetail: FunctionComponent<CustomerDetailProps> = () => {
  const params = useParams()

  const { data: currentCustomerData, isLoading, error } = useCustomerByIdQuery(params.id || '')
  const [customerData, setCustomerData] = useState<TransformedCustomerData | null>(null)

  // Memoize the filtered template (no filtering needed for customer)
  const filteredTemplate = useMemo(() => {
    if (!currentCustomerData) {
      return customerDetailsFields
    }
    return createFilteredTemplate(customerDetailsFields, currentCustomerData)
  }, [currentCustomerData])

  useEffect(() => {
    if (currentCustomerData) {
      const transformedData = transformCustomerData(currentCustomerData)
      setCustomerData(transformedData)
    }
  }, [currentCustomerData])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          Customer Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : error ? (
          <Alert
            type="error"
            message="Unable to get the customer details, please try later"
          />
        ) : (
          <PageDetail
            pageData={customerData || INITIAL_CUSTOMER}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default CustomerDetail
