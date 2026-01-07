import { Chain } from '@core/chain/Chain'
import { getCoinBalance } from '@core/chain/coin/balance'
import { deriveAddressFromMnemonic } from '@core/chain/publicKey/address/deriveAddressFromMnemonic'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { attempt, withFallback } from '@lib/utils/attempt'
import { useMutation } from '@tanstack/react-query'

import { useMnemonic } from '../state/mnemonic'

export const useScanChainsWithBalanceMutation = () => {
  const walletCore = useAssertWalletCore()
  const [mnemonic] = useMnemonic()

  return useMutation({
    mutationFn: async () => {
      const result: Chain[] = []

      for (const chain of Object.values(Chain)) {
        const address = deriveAddressFromMnemonic({
          chain,
          mnemonic,
          walletCore,
        })

        const balanceResult = await attempt(
          getCoinBalance({
            chain,
            address,
          })
        )

        const balance = withFallback(balanceResult, 0n)

        if (balance > 0n) {
          result.push(chain)
        }
      }

      return result
    },
  })
}
