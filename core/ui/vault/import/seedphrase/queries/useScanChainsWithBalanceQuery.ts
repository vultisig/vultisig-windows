import { Chain } from '@core/chain/Chain'
import { deriveAddressFromMnemonic } from '@core/chain/publicKey/address/deriveAddressFromMnemonic'
import { deriveSolanaAddressWithPhantomPath } from '@core/chain/publicKey/address/deriveSolanaAddressFromMnemonic'
import {
  BalanceQueryInput,
  useBalancesQuery,
} from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { EagerQuery } from '@lib/ui/query/Query'
import { useMemo } from 'react'

import { useMnemonic } from '../state/mnemonic'

type ScanChainsResult = {
  chains: Chain[]
  usePhantomSolanaPath: boolean
}

const phantomSolanaAddressKey = 'phantomSolana'

export const useScanChainsWithBalanceQuery =
  (): EagerQuery<ScanChainsResult> => {
    const walletCore = useAssertWalletCore()
    const [mnemonic] = useMnemonic()

    const inputs = useMemo(() => {
      const results: BalanceQueryInput[] = Object.values(Chain).map(chain => ({
        chain,
        address: deriveAddressFromMnemonic({ chain, mnemonic, walletCore }),
      }))

      results.push({
        chain: Chain.Solana,
        address: deriveSolanaAddressWithPhantomPath({ mnemonic, walletCore }),
        // We use a custom key for Phantom Solana to distinguish it from Trust Wallet Solana
        key: phantomSolanaAddressKey,
      })

      return results
    }, [mnemonic, walletCore])

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
      const chainsWithBalance = Object.values(Chain).filter(chain => {
        const balance = balances?.[chain]
        return balance !== undefined && balance > 0n
      })

      const phantomSolanaBalance = balances?.[phantomSolanaAddressKey] ?? 0n
      const trustSolanaBalance = balances?.[Chain.Solana] ?? 0n

      const usePhantomSolanaPath =
        phantomSolanaBalance > 0n && trustSolanaBalance === 0n

      if (
        phantomSolanaBalance > 0n &&
        !chainsWithBalance.includes(Chain.Solana)
      ) {
        chainsWithBalance.push(Chain.Solana)
      }

      return {
        isPending,
        errors,
        data: {
          chains: chainsWithBalance,
          usePhantomSolanaPath,
        },
      }
    }, [balancesQuery, inputs.length])
  }
