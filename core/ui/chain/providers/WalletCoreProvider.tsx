import { ChildrenProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { createContext, useContext, useEffect, useState } from 'react'

import { ProductLogoBlock } from '../../product/ProductLogoBlock'

const WalletCoreContext = createContext<WalletCore | null>(null)

export const WalletCoreProvider = ({ children }: ChildrenProp) => {
  const [wasm, setWasm] = useState<WalletCore | null>(null)
  useEffect(() => {
    const fetchWasm = async () => {
      const wasm = await initWasm()
      setWasm(wasm)
    }
    fetchWasm()
  }, [])

  if (!wasm) {
    return <ProductLogoBlock />
  }

  return (
    <WalletCoreContext.Provider value={wasm}>
      {children}
    </WalletCoreContext.Provider>
  )
}

export const useWalletCore = () => useContext(WalletCoreContext)

export const useAssertWalletCore = () => shouldBePresent(useWalletCore())
