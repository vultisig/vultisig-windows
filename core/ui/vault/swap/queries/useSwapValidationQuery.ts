import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
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
    },
    eager: false,
  })

  if (areEqualCoins(fromCoinKey, toCoinKey)) {
    return {
      data: t('swap_same_asset'),
      isPending: false,
      error: null,
    }
  }

  const recipient = externalRecipient.trim()
  if (
    recipient &&
    !isValidAddress({ chain: toCoinKey.chain, address: recipient, walletCore })
  ) {
    return {
      data: t('swap_invalid_external_recipient', { chain: toCoinKey.chain }),
      isPending: false,
      error: null,
    }
  }

  return combined
}
