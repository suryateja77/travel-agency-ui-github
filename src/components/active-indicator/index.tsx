import { FunctionComponent } from 'react'
import { bemClass } from '@utils'

import './style.scss'

const blk = 'active-indicator'

interface ActiveIndicatorProps {
  isActive?: boolean
  className?: string
}

const ActiveIndicator: FunctionComponent<ActiveIndicatorProps> = ({ 
  isActive = false, 
  className = '' 
}) => {
  return (
    <div 
      className={bemClass([
        blk, 
        { active: isActive, disabled: !isActive },
        className
      ])}
    >
      <span className={bemClass([blk, 'dot'])} />
      {isActive ? 'Active' : 'Disabled'}
    </div>
  )
}

export default ActiveIndicator