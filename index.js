import React from 'react'
import { createRoot } from 'react-dom/client'
import TanstackQueryProvider from '@api/queryProvider'

import App from './src/app'

if (module.hot) {
  module.hot.accept()
}

const rootElement = document.getElementById('app')
const root = createRoot(rootElement)

root.render(
  <TanstackQueryProvider>
    <App />
  </TanstackQueryProvider>,
)
