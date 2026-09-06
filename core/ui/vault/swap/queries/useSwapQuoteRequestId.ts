import { slippageToPercent } from '../form/advanced/slippage'
import { useAdvancedSwapSettings } from '../state/advancedSettings'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { getSwapQuoteRequestId } from './activeSwapRoute'

/**
 * The swap currently being composed, as the id a manual route pick is scoped
 * to. Derives slippage and recipient exactly as {@link useSwapQuotesQuery}
 * does, so the id moves with the quote request rather than with the raw form
 * state. Reads the raw form amount rather than the debounced one, so editing
 * the amount retires the pick as the user types instead of one debounce later.
 */
export const useSwapQuoteRequestId = () => {
  const [from] = useSwapFromCoin()
  const [to] = useSwapToCoin()
  const [amount] = useFromAmount()
  const [advancedSettings] = useAdvancedSwapSettings()

  return getSwapQuoteRequestId({
    from,
    to,
    amount,
    slippageTolerance: slippageToPercent(advancedSettings.slippage),
    recipient: advancedSettings.externalRecipient.trim() || undefined,
  })
}
