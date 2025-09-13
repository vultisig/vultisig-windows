import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useQuery } from '@tanstack/react-query'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { createContext, useContext } from 'react'

import { ProductLogoBlock } from '../../product/ProductLogoBlock'

const WalletCoreContext = createContext<WalletCore | null>(null)

export const WalletCoreProvider = ({ children }: ChildrenProp) => {
  const query = useQuery({
    queryKey: ['walletCore'],
    ...noRefetchQueryOptions,
    queryFn: async () => {
      const wasm = await initWasm()
      return wasm
    },
  })

  return (
    <MatchQuery
      value={query}
      success={value => (
        <WalletCoreContext.Provider value={value}>
          {children}
        </WalletCoreContext.Provider>
      )}
      pending={() => <ProductLogoBlock />}
      error={error => (
        <FlowErrorPageContent
          title="Failed to load wallet core"
          error={error}
        />
      )}
    />
  )
}

export const useWalletCore = () => useContext(WalletCoreContext)

export const useAssertWalletCore = () => shouldBePresent(useWalletCore())
