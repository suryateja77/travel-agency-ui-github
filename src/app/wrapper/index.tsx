import React, { lazy, Suspense } from 'react'

import { getStorageItem } from '@utils/storage'
import { ActivityProvider } from '@contexts/ActivityContext'

const BrowseApp = lazy(async () => await import(/* webpackChunkName: "browse-app" */ '../browse-app'))
const AuthenticationApp = lazy(async () => await import(/* webpackChunkName: "authentication-app" */ '../authentication-app'))

const Wrapper = () => {
  const isLoggedIn = !!getStorageItem('local', 'isLoggedIn')

  return (
    <Suspense>
      {isLoggedIn ? (
        <ActivityProvider>
          <BrowseApp />
        </ActivityProvider>
      ) : (
        <AuthenticationApp />
      )}
    </Suspense>
  )
}

export default Wrapper
