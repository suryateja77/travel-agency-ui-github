import React from 'react'

import Text from '@base/text'

import './style.scss'

const blk = 'logo'

const Logo = () => {
  return (
    <Text
      tag="div"
      typography="xxxxl"
      color={'gray-darker'}
      className={blk}
      id="logo"
    >
      Levart
    </Text>
  )
}
export default Logo
