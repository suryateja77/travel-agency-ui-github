import React, { useState } from 'react'

import { bemClass } from '@utils'
import { removeStorageItem } from '@utils/storage'

import { useLogoutMutation } from '@api/queries/user'

import Button from '@base/button'

import './style.scss'

type logOutProps = {
  category?: 'primary' | 'primary-outline' | 'success' | 'error'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const blk = 'logout'

const LogOut = ({
  category = 'primary',
  size = 'small',
  className,
}: logOutProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { mutateAsync: logout } = useLogoutMutation()

  const logoutHandler = async () => {
    setIsLoading(true)
  
    try {
      await logout()
      removeStorageItem('session', 'isLoggedIn')
      window.location.replace('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Button
      category={category}
      clickHandler={logoutHandler}
      loading={isLoading}
      size={size}
      className={bemClass([blk, {}, className])}
    >
      Logout
    </Button>
  )
}

export default LogOut
