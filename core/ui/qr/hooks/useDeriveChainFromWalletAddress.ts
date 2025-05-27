import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { useWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCallback } from 'react'

export const useDeriveChainFromWalletAddress = () => {
  const walletCore = useWalletCore()

  return useCallback(
    (address: string) => {
      const lowerAddress = address.toLowerCase()

      if (lowerAddress.includes('maya')) {
        return Chain.MayaChain
      }

      for (const chain of Object.values(Chain)) {
        if (!walletCore) break

        const coinType = getCoinType({
          chain,
          walletCore,
        })

        if (coinType && walletCore.AnyAddress.isValid(address, coinType)) {
          return chain
        }
      }

      return lowerAddress.startsWith('0x') ? Chain.Ethereum : null
    },
    [walletCore]
  )
}
