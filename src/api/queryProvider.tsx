'use client'

import React, { ReactNode, useState } from 'react'
import createQueryClient from './queryClient'
import { QueryClientProvider } from '@tanstack/react-query'

interface Props {
  children: ReactNode
}

const TanstackQueryProvider = ({ children }: Props) => {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default TanstackQueryProvider