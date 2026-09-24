import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { EagerQuery } from '@lib/ui/query/Query'
import { Chain } from '@vultisig/core-chain/Chain'
import { accountCoinKeyToString } from '@vultisig/core-chain/coin/AccountCoin'
import { deriveAddressFromMnemonic } from '@vultisig/core-chain/publicKey/address/deriveAddressFromMnemonic'
import { deriveSolanaAddressWithPhantomPath } from '@vultisig/core-chain/publicKey/address/deriveSolanaAddressFromMnemonic'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { SEEDPHRASE_IMPORT_SUPPORTED_CHAINS } from '@vultisig/sdk'
import { useMemo } from 'react'

import { useMnemonic } from '../state/mnemonic'

type ScanChainsResult = {
  chains: Chain[]
  unscannedChains: Chain[]
  usePhantomSolanaPath: boolean
}

/**
 * Checks the balance of every seedphrase-importable chain and suggests the
 * funded ones. Chains whose read failed are returned as `unscannedChains`
 * instead of blocking the result; the query only fails when every read failed.
 */
export const useScanChainsWithBalanceQuery =
  (): EagerQuery<ScanChainsResult> => {
    const walletCore = useAssertWalletCore()
    const [mnemonic] = useMnemonic()

    const { trustWalletInputs, phantomSolanaInput } = useMemo(() => {
      const trustWalletInputs = SEEDPHRASE_IMPORT_SUPPORTED_CHAINS.map(
        chain => ({
          chain,
          address: deriveAddressFromMnemonic({ chain, mnemonic, walletCore }),
        })
      )

      const phantomSolanaInput = {
        chain: Chain.Solana,
        address: deriveSolanaAddressWithPhantomPath({ mnemonic, walletCore }),
      }

      return { trustWalletInputs, phantomSolanaInput }
    }, [mnemonic, walletCore])

    const allInputs = useMemo(
      () => [...trustWalletInputs, phantomSolanaInput],
      [trustWalletInputs, phantomSolanaInput]
    )

    // Import discovery is a bounded one-shot scan, not a live wallet surface.
    // Polling every derived chain would keep an unnecessary RPC fanout alive.
    const balancesQuery = useBalancesQuery(allInputs, { live: false })

    return useMemo(() => {
      const { isPending, errors, data: balances } = balancesQuery

      // Check if all inputs have been resolved (based on data object size)
      const allInputsResolved =
        balances !== undefined &&
        Object.keys(balances).length >= allInputs.length

      // Still loading if pending AND not all inputs resolved yet
      if (isPending && !allInputsResolved) {
        return {
          isPending: true,
          errors,
          data: undefined,
        }
      }

      // A chain whose balance read failed is reported as unscanned rather than
      // blocking the rest, so the user can pick it manually. The scan only fails
      // when no chain resolved at all.
      if (!balances) {
        return {
          isPending,
          errors,
          data: undefined,
        }
      }

      // Find the Trust Wallet Solana input to get its key
      const trustSolanaInput = trustWalletInputs.find(
        input => input.chain === Chain.Solana
      )

      const trustSolanaKey = trustSolanaInput
        ? accountCoinKeyToString(trustSolanaInput)
        : ''
      const phantomSolanaKey = accountCoinKeyToString(phantomSolanaInput)

      const trustSolanaBalance = balances[trustSolanaKey] ?? 0n
      const phantomSolanaBalance = balances[phantomSolanaKey] ?? 0n

      // All queries settled - filter chains with positive balance
      const chainsWithBalance = SEEDPHRASE_IMPORT_SUPPORTED_CHAINS.filter(
        chain => {
          const input = trustWalletInputs.find(i => i.chain === chain)
          if (!input) return false
          const key = accountCoinKeyToString(input)
          const balance = balances[key]
          return balance !== undefined && balance > 0n
        }
      )

      // Follow the path with confirmed funds: a failed Trust Wallet read must not
      // import Solana on a path we never saw a balance on.
      const usePhantomSolanaPath =
        phantomSolanaBalance > 0n && trustSolanaBalance === 0n

      if (
        phantomSolanaBalance > 0n &&
        !chainsWithBalance.includes(Chain.Solana)
      ) {
        chainsWithBalance.push(Chain.Solana)
      }

      const failedCoins = new Set(balancesQuery.failedCoins)
      const unscannedChains = withoutDuplicates(
        allInputs
          .filter(input => failedCoins.has(accountCoinKeyToString(input)))
          .map(({ chain }) => chain)
      ).filter(chain => !chainsWithBalance.includes(chain))

      return {
        isPending,
        errors,
        data: {
          chains: chainsWithBalance,
          unscannedChains,
          usePhantomSolanaPath,
        },
      }
    }, [balancesQuery, allInputs, trustWalletInputs, phantomSolanaInput])
  }
