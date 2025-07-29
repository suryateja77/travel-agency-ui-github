import React, { FunctionComponent } from 'react'

import './style.scss'
import { bemClass } from '@utils'
import Anchor from '@base/anchor'
import Text from '@base/text'

type BreadCrumbData = {
  label: string
  route?: string
}

interface BreadCrumbProps {
  data: Array<BreadCrumbData>
}

const elt = 'breadcrumb'

const BreadCrumb: FunctionComponent<BreadCrumbProps> = ({ data }) => {
  return (
    <div className={bemClass([elt])}>
      <ul>
        {data.map(({ route, label }, index) => {
          const key = `bread-crumb-item-${index}`
          return (
            <li
              key={key}
            >
              {route ? (
                <Anchor
                  href={route}
                  color="gray"
                  asLink
                  noUnderline
                >
                  {label}
                </Anchor>
              ) : (
                <Text
                  tag="span"
                  color="gray-darker"
                >
                  {label}
                </Text>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default BreadCrumb
