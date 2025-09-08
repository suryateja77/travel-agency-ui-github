import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatBooleanValueForDisplay } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { supplierDetailsFields } from './model'
import { SupplierModel, INITIAL_SUPPLIER, Panel } from '@types'
import PageDetail from '@base/page-detail'
import { useSupplierByIdQuery } from '@api/queries/supplier'

const blk = 'supplier-detail'

interface SupplierDetailProps {}

interface TransformedSupplierData extends Record<string, any> {
  companyName: string
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
  pointOfContact: {
    name: string
    designation: string
    email: string
    contact: string
  }
  isActive: string
  comment: string
}

// Transform the supplier data to handle object references and formatting
const transformSupplierData = (data: SupplierModel): TransformedSupplierData => {
  return {
    ...data,
    email: data.email || '-',
    comment: data.comment || '-',
    isActive: formatBooleanValueForDisplay(data.isActive),
    // Ensure nested objects are properly structured
    address: {
      addressLine1: data.address?.addressLine1 || '-',
      addressLine2: data.address?.addressLine2 || '-',
      city: data.address?.city || '-',
      state: data.address?.state || '-',
      pinCode: data.address?.pinCode || '-',
    },
    pointOfContact: {
      name: data.pointOfContact?.name || '-',
      designation: data.pointOfContact?.designation || '-',
      email: data.pointOfContact?.email || '-',
      contact: data.pointOfContact?.contact || '-',
    },
  }
}

// No conditional filtering needed for supplier - all panels always show
const createFilteredTemplate = (originalTemplate: Panel[], data: SupplierModel): Panel[] => {
  return originalTemplate
}

const SupplierDetail: FunctionComponent<SupplierDetailProps> = () => {
  const params = useParams()

  const { data: currentSupplierData, isLoading, error } = useSupplierByIdQuery(params.id || '')
  const [supplierData, setSupplierData] = useState<TransformedSupplierData | null>(null)

  // Memoize the filtered template (no filtering needed for supplier)
  const filteredTemplate = useMemo(() => {
    if (!currentSupplierData) {
      return supplierDetailsFields
    }
    return createFilteredTemplate(supplierDetailsFields, currentSupplierData)
  }, [currentSupplierData])

  useEffect(() => {
    if (currentSupplierData) {
      const transformedData = transformSupplierData(currentSupplierData)
      setSupplierData(transformedData)
    }
  }, [currentSupplierData])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          Supplier Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : error ? (
          <Alert
            type="error"
            message="Unable to get the supplier details, please try later"
          />
        ) : (
          <PageDetail
            pageData={supplierData || INITIAL_SUPPLIER}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default SupplierDetail
