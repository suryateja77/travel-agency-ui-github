import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import AuthHeader from '@components/auth-header'

const Login = lazy(async () => await import(/* webpackChunkName: "authentication-app-login" */ '../../pages/authentication-app/login'))

const AuthenticationApp = () => (
  <>
    <AuthHeader />
    <Suspense>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  </>
)

export default AuthenticationApp
