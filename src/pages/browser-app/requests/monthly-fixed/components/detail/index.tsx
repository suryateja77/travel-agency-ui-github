import { FunctionComponent } from 'react'
import { Text } from '@base'
import { bemClass } from '@utils'

const blk = 'monthly-fixed-request-detail'

interface MonthlyFixedRequestDetailProps {}

const MonthlyFixedRequestDetail: FunctionComponent<MonthlyFixedRequestDetailProps> = () => {
  return (
    <div className={bemClass([blk])}>
      <Text>Monthly Fixed Request Detail - Coming Soon</Text>
    </div>
  )
}

export default MonthlyFixedRequestDetail