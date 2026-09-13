import { ChildrenProp } from '@lib/ui/props'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { createContext, useContext, useEffect, useState } from 'react'

import { StartupPlaceholder } from '../../product/StartupPlaceholder'

const WalletCoreContext = createContext<WalletCore | null>(null)

let walletCoreLoading: Promise<WalletCore> | null = null

/**
 * Starts loading the WalletCore WASM once per realm and returns the shared
 * promise, so the provider, suspending consumers and work that runs before the
 * provider has a value all wait on the same initialisation. A failed load is
 * retried on the next call.
 */
export const loadWalletCore = () => {
  if (!walletCoreLoading) {
    walletCoreLoading = initWasm().catch((error: unknown) => {
      walletCoreLoading = null
      throw error
    })
  }

  return walletCoreLoading
}

type WalletCoreProviderProps = ChildrenProp & {
  /**
   * Hold the whole tree on the startup placeholder until the WASM is ready.
   * When off, children render at once and `useAssertWalletCore` suspends
   * until it has loaded, so screens that need it wait behind their own
   * Suspense boundary instead of the shell.
   */
  blocking?: boolean
}

export const WalletCoreProvider = ({
  children,
  blocking = true,
}: WalletCoreProviderProps) => {
  const [wasm, setWasm] = useState<WalletCore | null>(null)

  useEffect(() => {
    loadWalletCore().then(setWasm)
  }, [])

  if (!wasm && blocking) {
    return <StartupPlaceholder />
  }

  return (
    <WalletCoreContext.Provider value={wasm}>
      {children}
    </WalletCoreContext.Provider>
  )
}

export const useWalletCore = () => useContext(WalletCoreContext)

/**
 * WalletCore for code that cannot run without it. Under a non-blocking
 * provider this suspends until the WASM has loaded, so call it from components
 * that sit below a Suspense boundary.
 */
export const useAssertWalletCore = () => {
  const walletCore = useWalletCore()

  if (walletCore) {
    return walletCore
  }

  // Suspends the way React.lazy does: the nearest boundary shows its fallback
  // and retries once the load settles, by which time the provider has the value.
  throw loadWalletCore()
}
