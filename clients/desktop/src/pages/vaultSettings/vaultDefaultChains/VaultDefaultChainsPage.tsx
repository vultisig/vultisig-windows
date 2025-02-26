import React from 'react'

import { CurrentSearchProvider } from '../../../lib/ui/search/CurrentSearchProvider'
import VaultDefaultChains from './VaultDefaultChains'

const VaultDefaultChainsPage = () => {
  return (
    <CurrentSearchProvider initialValue="">
      <VaultDefaultChains />
    </CurrentSearchProvider>
  )
}

export default VaultDefaultChainsPage
