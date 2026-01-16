import React from 'react'

import Text from '@base/text'
import LogoImage from '@images/logos/logo-icon.webp'

import './style.scss'

const blk = 'logo'

const Logo = () => {
  return (
    <>
      <img
        src={LogoImage}
        alt="Levart Logo"
        className={blk}
      />
      <Text
        tag="div"
        typography="xxxxl"
        color={'gray-darker'}
        id="logo"
      >
        Levart
      </Text>
    </>
  )
}
export default Logo
