import { Chain } from '@core/chain/Chain'
import { useCallback } from 'react'

import { useWalletCore } from '../../../providers/WalletCoreProvider'

export const useDeriveChainFromWalletAddress = () => {
  const walletCore = useWalletCore()

  return useCallback(
    (address: string) => {
      if (!address) return null
      const lowerAddress = address.toLowerCase()

      if (lowerAddress.includes('maya')) {
        return Chain.MayaChain
      }

      for (const chain of Object.values(Chain)) {
        const coinType =
          walletCore?.CoinType[
            chain.toLowerCase() as keyof typeof walletCore.CoinType
          ]

        if (coinType && walletCore.AnyAddress.isValid(address, coinType)) {
          return chain
        }
      }

      return lowerAddress.startsWith('0x') ? Chain.Ethereum : null
    },
    [walletCore]
  )
}
