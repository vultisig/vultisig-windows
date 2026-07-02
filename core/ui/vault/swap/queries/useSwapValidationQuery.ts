import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { WalletCore } from '@trustwallet/wallet-core'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { isValidAddress } from '@vultisig/core-chain/utils/isValidAddress'
import { t } from 'i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useSwapQuoteQuery } from '../queries/useSwapQuoteQuery'
import { useAdvancedSwapSettings } from '../state/advancedSettings'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

type GetSwapBalanceValidationErrorInput = {
  amount: bigint | null | undefined
  balance: bigint
}

export const getSwapBalanceValidationError = ({
  amount,
  balance,
}: GetSwapBalanceValidationErrorInput): string | null => {
  if (amount === null || amount === undefined) {
    return t('amount_required')
  }

  if (amount <= 0n) {
    return t('amount_required')
  }

  if (amount > balance) {
    return t('swap_insufficient_funds')
  }

  return null
}

type GetImmediateSwapValidationErrorInput = {
  fromCoinKey: Parameters<typeof areEqualCoins>[0]
  toCoinKey: Parameters<typeof areEqualCoins>[1]
  externalRecipient: string
  walletCore: WalletCore
}

export const getImmediateSwapValidationError = ({
  fromCoinKey,
  toCoinKey,
  externalRecipient,
  walletCore,
}: GetImmediateSwapValidationErrorInput): string | null => {
  if (areEqualCoins(fromCoinKey, toCoinKey)) {
    return t('swap_same_asset')
  }

  const recipient = externalRecipient.trim()
  if (
    recipient &&
    !isValidAddress({ chain: toCoinKey.chain, address: recipient, walletCore })
  ) {
    return t('swap_invalid_external_recipient', { chain: toCoinKey.chain })
  }

  return null
}

export const useSwapValidationQuery = () => {
  const [amount] = useFromAmount()

  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const [{ externalRecipient }] = useAdvancedSwapSettings()
  const walletCore = useAssertWalletCore()
  const coin = useCurrentVaultCoin(fromCoinKey)
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const swapQuoteQuery = useSwapQuoteQuery()
  const firmSwapQuoteQuery = swapQuoteQuery.isPlaceholderData
    ? { ...swapQuoteQuery, data: undefined, isPending: true }
    : swapQuoteQuery

  const combined = useCombineQueries({
    queries: {
      balance: balanceQuery,
      swapQuote: firmSwapQuoteQuery,
    },
    joinData: ({ balance }) => {
      return getSwapBalanceValidationError({ amount, balance })
    },
    eager: false,
  })

  const immediateError = getImmediateSwapValidationError({
    fromCoinKey,
    toCoinKey,
    externalRecipient,
    walletCore,
  })
  if (immediateError) {
    return {
      data: immediateError,
      isPending: false,
      error: null,
    }
  }

  return combined
}
