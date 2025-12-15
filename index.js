import React from 'react'
import { createRoot } from 'react-dom/client'
import TanstackQueryProvider from '@api/queryProvider'
import { ToastProvider } from './src/contexts/ToastContext'
import { AuthProvider } from './src/contexts/AuthContext'

import App from './src/app'

if (module.hot) {
  module.hot.accept()
}

const rootElement = document.getElementById('app')
const root = createRoot(rootElement)

root.render(
  <TanstackQueryProvider>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </TanstackQueryProvider>,
)
