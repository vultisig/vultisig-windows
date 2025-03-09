import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { createContext, useContext, useEffect, useState } from 'react'

const WalletCoreContext = createContext<WalletCore | null>(null)

export const WalletCoreProvider = ({ children }: { children: any }) => {
  const [wasmModule, setWasmModule] = useState<WalletCore | null>(null)

  useEffect(() => {
    const loadWasm = async () => {
      const walletCore = await initWasm()
      setWasmModule(walletCore)
    }
    loadWasm()
  }, [])

  return (
    <WalletCoreContext.Provider value={wasmModule}>
      {children}
    </WalletCoreContext.Provider>
  )
}

export const useWalletCore = () => useContext(WalletCoreContext)

export const useAssertWalletCore = () => shouldBePresent(useWalletCore())
