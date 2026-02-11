import { Chain } from '@core/chain/Chain'
import { accountCoinKeyToString } from '@core/chain/coin/AccountCoin'
import { deriveAddressFromMnemonic } from '@core/chain/publicKey/address/deriveAddressFromMnemonic'
import { deriveSolanaAddressWithPhantomPath } from '@core/chain/publicKey/address/deriveSolanaAddressFromMnemonic'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { EagerQuery } from '@lib/ui/query/Query'
import { useMemo } from 'react'

import { seedphraseImportSupportedChains } from '../config'
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
      const trustWalletInputs = seedphraseImportSupportedChains.map(chain => ({
        chain,
        address: deriveAddressFromMnemonic({ chain, mnemonic, walletCore }),
      }))

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

    const balancesQuery = useBalancesQuery(allInputs)

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

      // Find the Trust Wallet Solana input to get its key
      const trustSolanaInput = trustWalletInputs.find(
        input => input.chain === Chain.Solana
      )

      const trustSolanaKey = trustSolanaInput
        ? accountCoinKeyToString(trustSolanaInput)
        : ''
      const phantomSolanaKey = accountCoinKeyToString(phantomSolanaInput)

      const trustSolanaBalance = balances?.[trustSolanaKey] ?? 0n
      const phantomSolanaBalance = balances?.[phantomSolanaKey] ?? 0n

      // All queries settled - filter chains with positive balance
      const chainsWithBalance = seedphraseImportSupportedChains.filter(
        chain => {
          const input = trustWalletInputs.find(i => i.chain === chain)
          if (!input) return false
          const key = accountCoinKeyToString(input)
          const balance = balances?.[key]
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
