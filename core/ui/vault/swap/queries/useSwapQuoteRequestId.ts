import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { getSwapQuoteRequestId } from './activeSwapRoute'

/**
 * The swap currently being composed, as the id a manual route pick is scoped
 * to. Reads the raw form amount rather than the debounced one the quote query
 * uses, so editing the amount retires the pick as the user types instead of
 * one debounce later.
 */
export const useSwapQuoteRequestId = () => {
  const [from] = useSwapFromCoin()
  const [to] = useSwapToCoin()
  const [amount] = useFromAmount()

  return getSwapQuoteRequestId({ from, to, amount })
}
