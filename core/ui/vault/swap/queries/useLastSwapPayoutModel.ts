import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { areEqualCoins, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { useEffect, useState } from 'react'

import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { getSwapPayoutModel, SwapPayoutModel } from './swapPayoutModel'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

type PairedSwapPayoutModel = {
  fromCoinKey: CoinKey
  toCoinKey: CoinKey
  model: SwapPayoutModel
}

const isSameFit = (a: PairedSwapPayoutModel, b: PairedSwapPayoutModel) =>
  areEqualCoins(a.fromCoinKey, b.fromCoinKey) &&
  areEqualCoins(a.toCoinKey, b.toCoinKey) &&
  a.model.rate === b.model.rate &&
  a.model.proportionalFeeFraction === b.model.proportionalFeeFraction &&
  a.model.flatFee === b.model.flatFee

/**
 * The payout model fitted to the last firm quote for the pair currently
 * selected, or `null` when no readable quote has settled for it yet.
 *
 * Held in state rather than read off the query because the quote query blanks
 * its data during the amount debounce — the fit has to outlive that window, or
 * the estimate it feeds would visibly jump when the debounce settles. State
 * rather than a ref so the estimate re-renders when a new quote refines the
 * fit; a ref read during render is both a React Compiler bail-out and a value
 * that silently stays one render stale.
 *
 * Scoped to the pair: a fit from another pair is never returned, so a freshly
 * selected pair falls back to spot until its own first quote lands.
 */
export const useLastSwapPayoutModel = (): SwapPayoutModel | null => {
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const query = useSwapQuoteQuery()
  const firmQuote = query.isPlaceholderData ? undefined : query.data

  const [held, setHeld] = useState<PairedSwapPayoutModel | null>(null)

  useEffect(() => {
    if (!firmQuote) {
      return
    }

    const model = getSwapPayoutModel({
      quote: firmQuote.quote,
      input: fromChainAmount(firmQuote.requestedAmount, fromCoin.decimals),
      toCoinKey,
      toCoinDecimals: toCoin.decimals,
    })

    if (!model) {
      return
    }

    const fit = { fromCoinKey, toCoinKey, model }

    setHeld(previous => (previous && isSameFit(previous, fit) ? previous : fit))
  }, [firmQuote, fromCoin.decimals, fromCoinKey, toCoin.decimals, toCoinKey])

  if (!held) {
    return null
  }

  const isSamePair =
    areEqualCoins(held.fromCoinKey, fromCoinKey) &&
    areEqualCoins(held.toCoinKey, toCoinKey)

  return isSamePair ? held.model : null
}
