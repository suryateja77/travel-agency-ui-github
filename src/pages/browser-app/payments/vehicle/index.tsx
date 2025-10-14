import React, { FunctionComponent } from 'react'

import { bemClass } from '@utils'

import './style.scss'

const blk = 'vehicle-payments'

interface VehiclePaymentsProps {}

const VehiclePayments: FunctionComponent<VehiclePaymentsProps> = () => {
  return <div className={bemClass([blk])}>Vehicle Payments</div>
}

export default VehiclePayments
