import Text from '@base/text'
import { bemClass } from '@utils'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import './style.scss'
import Loader from '@components/loader'
import { staffDetailsFields } from './model'
import { StaffModel, INITIAL_STAFF } from '@types'
import PageDetail from '@base/page-detail'
import { useStaffByIdQuery } from '@api/queries/staff'

const blk = 'staff-detail'

interface StaffDetailProps {}

const StaffDetail: FunctionComponent<StaffDetailProps> = () => {
  const params = useParams()

  const {data: currentStaffData, isLoading} = useStaffByIdQuery(params.id || '')
  const [staffData, setStaffData] = useState<StaffModel>(INITIAL_STAFF)

  useEffect(() => {
    if (currentStaffData) {
        console.log('Fetched staff data:', currentStaffData)
      setStaffData(currentStaffData)
    }
  }, [currentStaffData])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Agent Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : (
          <PageDetail pageData={staffData} pageDataTemplate={staffDetailsFields} />
        )}
      </div>
    </div>
  )
}

export default StaffDetail
