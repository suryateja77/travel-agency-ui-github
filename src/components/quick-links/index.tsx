import React, { FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'
import { bemClass } from '@utils'
import Icon from '@base/icon'

import './style.scss'

const blk = 'quick-links'

interface QuickLink {
  title: string
  description: string
  icon: string
  route: string
  color: string
}

interface QuickLinksProps {
  className?: string
}

const QUICK_LINKS: QuickLink[] = [
  {
    title: 'Create Regular Request',
    description: 'Add a new trip request',
    icon: 'plus',
    route: '/requests/regular/create',
    color: '#2196F3'
  },
  {
    title: 'Add Advance Payment',
    description: 'Record advance payment',
    icon: 'coins',
    route: '/advance-payments/create',
    color: '#4CAF50'
  },
  {
    title: 'Add Vehicle',
    description: 'Register a new vehicle',
    icon: 'car',
    route: '/vehicles/own/create',
    color: '#FF9800'
  },
  {
    title: 'Create Advance Booking',
    description: 'Schedule future booking',
    icon: 'calendar',
    route: '/advance-booking/create',
    color: '#9C27B0'
  }
]

const QuickLinks: FunctionComponent<QuickLinksProps> = ({
  className = ''
}) => {
  const navigate = useNavigate()

  const handleLinkClick = (route: string) => {
    navigate(route)
  }

  return (
    <div className={bemClass([blk, className])}>
      <div className={bemClass([blk, 'header'])}>
        <h3 className={bemClass([blk, 'title'])}>Quick Actions</h3>
      </div>

      <div className={bemClass([blk, 'grid'])}>
        {QUICK_LINKS.map((link, index) => (
          <button
            key={index}
            className={bemClass([blk, 'card'])}
            onClick={() => handleLinkClick(link.route)}
            style={{ '--card-color': link.color } as React.CSSProperties}
          >
            <div className={bemClass([blk, 'card-icon'])}>
              <Icon name={link.icon} size="30" />
            </div>
            <div className={bemClass([blk, 'card-content'])}>
              <h4 className={bemClass([blk, 'card-title'])}>{link.title}</h4>
              <p className={bemClass([blk, 'card-description'])}>{link.description}</p>
            </div>
            <div className={bemClass([blk, 'card-arrow'])}>
              <Icon name="arrow-right" size="16" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickLinks
