import React, { lazy, Suspense } from 'react'

import { getStorageItem } from '@utils/storage'

const BrowseApp = lazy(async () => await import(/* webpackChunkName: "browse-app" */ '../browse-app'))
const AuthenticationApp = lazy(async () => await import(/* webpackChunkName: "authentication-app" */ '../authentication-app'))

const Wrapper = () => {
  const isLoggedIn = !!getStorageItem('session', 'isLoggedIn')
  return <Suspense>{isLoggedIn ? <BrowseApp /> : <AuthenticationApp />}</Suspense>
}

export default Wrapper
