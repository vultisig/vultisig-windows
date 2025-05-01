import { CurrentSearchProvider } from '@lib/ui/search/CurrentSearchProvider'
import VaultDefaultChains from './VaultDefaultChains'

export const VaultDefaultChainsPage = () => {
  return (
    <CurrentSearchProvider initialValue="">
      <VaultDefaultChains />
    </CurrentSearchProvider>
  )
}
