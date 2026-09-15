import { ChildrenProp } from '@lib/ui/props'
import type { WalletCore } from '@trustwallet/wallet-core'
import { createContext, useContext, useEffect, useState } from 'react'

import { StartupLoadError } from '../../product/StartupLoadError'
import { StartupPlaceholder } from '../../product/StartupPlaceholder'

const WalletCoreContext = createContext<WalletCore | null>(null)

type WalletCoreLoad = {
  loading: Promise<WalletCore> | null
  error: unknown
}

const walletCoreLoad: WalletCoreLoad = { loading: null, error: null }

/**
 * Starts loading the WalletCore WASM once per realm and returns the shared
 * promise, so the provider, suspending consumers and work that runs before the
 * provider has a value all wait on the same initialisation. The package is
 * imported here on demand, so its JS glue stays out of the entry chunk. A
 * failure is kept as the load's error until the next call, which starts a
 * fresh attempt.
 */
export const loadWalletCore = () => {
  if (!walletCoreLoad.loading) {
    walletCoreLoad.error = null
    walletCoreLoad.loading = import('@trustwallet/wallet-core')
      .then(({ initWasm }) => initWasm())
      .catch((error: unknown) => {
        walletCoreLoad.loading = null
        walletCoreLoad.error = error
        throw error
      })
  }

  return walletCoreLoad.loading
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

/**
 * Provides the WalletCore WASM to the tree, loading it once on mount. A load
 * that fails replaces the tree with an error page whose action starts the load
 * again, in both modes.
 */
export const WalletCoreProvider = ({
  children,
  blocking = true,
}: WalletCoreProviderProps) => {
  const [wasm, setWasm] = useState<WalletCore | null>(null)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    loadWalletCore().then(setWasm, setError)
  }, [])

  if (error !== null) {
    return (
      <StartupLoadError
        error={error}
        onRetry={() => {
          setError(null)
          loadWalletCore().then(setWasm, setError)
        }}
      />
    )
  }

  if (!wasm && blocking) {
    return <StartupPlaceholder />
  }

  return (
    <WalletCoreContext.Provider value={wasm}>
      {children}
    </WalletCoreContext.Provider>
  )
}

/** The loaded WalletCore, or `null` while a non-blocking provider is still loading it. */
export const useWalletCore = () => useContext(WalletCoreContext)

/**
 * WalletCore for code that cannot run without it. Under a non-blocking
 * provider this suspends until the WASM has loaded, so call it from components
 * that sit below a Suspense boundary. Once a load has failed it throws that
 * error instead, leaving the retry to the provider's error page.
 */
export const useAssertWalletCore = () => {
  const walletCore = useWalletCore()

  if (walletCore) {
    return walletCore
  }

  if (walletCoreLoad.error !== null) {
    throw walletCoreLoad.error
  }

  // Suspends the way React.lazy does: the nearest boundary shows its fallback
  // and retries once the load settles, by which time the provider has the value.
  throw loadWalletCore()
}
