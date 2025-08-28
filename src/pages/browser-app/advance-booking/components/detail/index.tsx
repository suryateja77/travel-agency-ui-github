import Text from '@base/text'
import { bemClass, formatBooleanValueForDisplay, formatDateValueForDisplay } from '@utils'
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import './style.scss'
import Loader from '@components/loader'
import { advanceBookingDetailsFields } from './model'
import { AdvanceBookingModel, INITIAL_ADVANCE_BOOKING, Panel, Field } from '@types'
import PageDetail from '@base/page-detail'
import { useAdvanceBookingByIdQuery } from '@api/queries/advance-booking'
import { Alert } from '@base'

const blk = 'advance-booking-detail'

interface AdvanceBookingDetailProps {}

interface TransformedAdvanceBookingData extends Record<string, any> {
  customerType: string
  pickUpLocation: string
  dropOffLocation: string
  pickUpDateTime: string
  noOfSeats: string | number
  hasAc: string
  vehicleType: string
  customerCategory: string
  customerName: string
  comment: string
}

const formatCustomerType = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// Transform the advance booking data to handle object references and formatting
const transformAdvanceBookingData = (data: AdvanceBookingModel): TransformedAdvanceBookingData => {
  return {
    ...data,
    customerType: formatCustomerType(data.customerType),
    hasAc: formatBooleanValueForDisplay(data.hasAc),
    pickUpDateTime: formatDateValueForDisplay(data.pickUpDateTime),
    noOfSeats: data.noOfSeats?.toString() || '-',
    customerCategory: data.customerCategory || '-',
    // Handle customer object - if customer is an object, extract the name, otherwise use the string
    customerName: data.customer && typeof data.customer === 'object' && 'name' in data.customer ? (data.customer as any).name : data.customer,
    comment: data.comment,
  }
}

// Create filtered template based on customer type
const createFilteredTemplate = (originalTemplate: Panel[], customerType: string): Panel[] => {
  return originalTemplate.map(panel => {
    if (panel.panel !== 'Customer Information') {
      return panel
    }

    const filteredFields: Field[] = panel.fields.filter(field => {
      if (customerType === 'existing') {
        // For existing customers, remove new customer detail fields
        return !['customerDetails.name', 'customerDetails.contact', 'customerDetails.email'].includes(field.path)
      } else {
        // For new customers, remove existing customer fields
        return !['customerCategory', 'customer.name'].includes(field.path)
      }
    })

    return {
      ...panel,
      fields: filteredFields,
    }
  })
}

const AdvanceBookingDetail: FunctionComponent<AdvanceBookingDetailProps> = () => {
  const params = useParams()

  const { data: currentAdvanceBookingData, isLoading, error } = useAdvanceBookingByIdQuery(params.id || '')
  const [advanceBookingData, setAdvanceBookingData] = useState<TransformedAdvanceBookingData | null>(null)

  // Memoize the filtered template based on customer data
  const filteredTemplate = useMemo(() => {
    if (!currentAdvanceBookingData) {
      return advanceBookingDetailsFields
    }
    return createFilteredTemplate(advanceBookingDetailsFields, currentAdvanceBookingData.customerType)
  }, [currentAdvanceBookingData])

  useEffect(() => {
    if (currentAdvanceBookingData) {
      const transformedData = transformAdvanceBookingData(currentAdvanceBookingData)
      setAdvanceBookingData(transformedData)
    }
  }, [currentAdvanceBookingData])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Advance Booking Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : error ? (
          <Alert
            type="error"
            message={'Unable to get the details, please try later'}
          />
        ) : (
          <PageDetail
            pageData={advanceBookingData || INITIAL_ADVANCE_BOOKING}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default AdvanceBookingDetail
