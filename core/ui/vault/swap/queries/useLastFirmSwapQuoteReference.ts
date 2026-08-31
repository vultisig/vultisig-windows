import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { areEqualCoins, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { useEffect, useRef } from 'react'

import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { getSwapQuoteOutput } from './swapQuoteOutput'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

/** What one settled quote promised, in whole-token units on both sides. */
export type FirmSwapQuoteReference = {
  fromCoinKey: CoinKey
  toCoinKey: CoinKey
  input: number
  output: number
}

/**
 * The last firm quote seen for the pair currently selected, or `null` when
 * there has not been one yet.
 *
 * Held in a ref rather than read off the query because the quote query blanks
 * its data during the amount debounce — the reference has to outlive that
 * window, or the estimate it feeds would visibly jump when the debounce
 * settles. Cleared implicitly by the pair check: a reference from another pair
 * is not returned.
 */
export const useLastFirmSwapQuoteReference =
  (): FirmSwapQuoteReference | null => {
    const [fromCoinKey] = useSwapFromCoin()
    const [toCoinKey] = useSwapToCoin()
    const fromCoin = useCurrentVaultCoin(fromCoinKey)
    const toCoin = useCurrentVaultCoin(toCoinKey)

    const query = useSwapQuoteQuery()
    const firmQuote = query.isPlaceholderData ? undefined : query.data

    const reference = useRef<FirmSwapQuoteReference | null>(null)

    useEffect(() => {
      if (!firmQuote) {
        return
      }

      const { amount, decimals } = getSwapQuoteOutput({
        quote: firmQuote.quote,
        toCoinKey,
        toCoinDecimals: toCoin.decimals,
      })

      reference.current = {
        fromCoinKey,
        toCoinKey,
        input: fromChainAmount(firmQuote.requestedAmount, fromCoin.decimals),
        output: fromChainAmount(amount, decimals),
      }
    }, [firmQuote, fromCoin.decimals, fromCoinKey, toCoin.decimals, toCoinKey])

    const held = reference.current
    if (!held) {
      return null
    }

    const isSamePair =
      areEqualCoins(held.fromCoinKey, fromCoinKey) &&
      areEqualCoins(held.toCoinKey, toCoinKey)

    return isSamePair ? held : null
  }
