import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { WalletCore } from '@trustwallet/wallet-core'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { BoundSwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
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

/** Input for swap amount and balance validation. */
type GetSwapBalanceValidationErrorInput = {
  amount: bigint | null | undefined
  balance: bigint
}

/** Returns the synchronous validation error for a swap amount and available balance. */
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

/**
 * Rejects a quote whose absolute expiry has already passed. React Query keeps a
 * quote for a day and retains it when a refetch fails, so a cached one can be
 * displayed long after it was fetched — returning to an unchanged pair and
 * amount while offline is enough. Nothing else in the swap flow compares a
 * quote against the clock, so without this the user can submit a stale price.
 */
export const getSwapQuoteExpiryValidationError = (
  quote: BoundSwapQuote,
  now: number = Date.now()
): string | null => (quote.expiresAt <= now ? t('swap_quote_expired') : null)

/** Input for swap validation that does not depend on async quote or balance data. */
type GetImmediateSwapValidationErrorInput = {
  fromCoinKey: Parameters<typeof areEqualCoins>[0]
  toCoinKey: Parameters<typeof areEqualCoins>[1]
  externalRecipient: string
  walletCore: WalletCore
}

/** Returns the synchronous validation error for same-asset and external-recipient checks. */
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
    joinData: ({ balance, swapQuote }) => {
      return (
        getSwapBalanceValidationError({ amount, balance }) ??
        getSwapQuoteExpiryValidationError(swapQuote)
      )
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
