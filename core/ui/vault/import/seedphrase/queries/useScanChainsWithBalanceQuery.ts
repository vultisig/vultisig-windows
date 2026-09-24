import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { EagerQuery } from '@lib/ui/query/Query'
import { Chain } from '@vultisig/core-chain/Chain'
import { accountCoinKeyToString } from '@vultisig/core-chain/coin/AccountCoin'
import { deriveAddressFromMnemonic } from '@vultisig/core-chain/publicKey/address/deriveAddressFromMnemonic'
import { deriveSolanaAddressWithPhantomPath } from '@vultisig/core-chain/publicKey/address/deriveSolanaAddressFromMnemonic'
import { SEEDPHRASE_IMPORT_SUPPORTED_CHAINS } from '@vultisig/sdk'
import { useMemo } from 'react'

import { useMnemonic } from '../state/mnemonic'

type ScanChainsResult = {
  chains: Chain[]
  usePhantomSolanaPath: boolean
}

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

      // A chain whose balance read failed is left out of the suggestions rather
      // than blocking the rest; the user can still add it via "Customize chains".
      // The scan only fails when no chain resolved at all.
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

      // Undefined when the Trust Wallet Solana read failed, so the Phantom path
      // is only chosen when the Trust Wallet path is known to be empty.
      const trustSolanaBalance: bigint | undefined = balances[trustSolanaKey]
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
    }, [balancesQuery, allInputs.length, trustWalletInputs, phantomSolanaInput])
  }
