import { Chain } from '@core/chain/Chain'
import { deriveAddressFromMnemonic } from '@core/chain/publicKey/address/deriveAddressFromMnemonic'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { EagerQuery } from '@lib/ui/query/Query'
import { useMemo } from 'react'

import { useMnemonic } from '../state/mnemonic'

export const useScanChainsWithBalanceQuery = (): EagerQuery<Chain[]> => {
  const walletCore = useAssertWalletCore()
  const [mnemonic] = useMnemonic()

  const inputs = useMemo(
    () =>
      Object.values(Chain).map(chain => ({
        chain,
        address: deriveAddressFromMnemonic({ chain, mnemonic, walletCore }),
      })),
    [mnemonic, walletCore]
  )

  const balancesQuery = useBalancesQuery(inputs)

  return useMemo(() => {
    const { isPending, errors, data: balances } = balancesQuery

    // Check if all inputs have been resolved (based on data object size)
    const allInputsResolved =
      balances !== undefined && Object.keys(balances).length >= inputs.length

    // Still loading if pending AND not all inputs resolved yet
    if (isPending && !allInputsResolved) {
      return {
        isPending: true,
        errors,
        data: undefined,
      }
    }

    // All queries settled - filter chains with positive balance
    // balances keys are chain names (coinKeyToString({ chain }) = chain for native coins)
    const chainsWithBalance = Object.values(Chain).filter(chain => {
      const balance = balances?.[chain]
      return balance !== undefined && balance > 0n
    })

    return {
      isPending,
      errors,
      data: chainsWithBalance,
    }
  }, [balancesQuery, inputs.length])
}
