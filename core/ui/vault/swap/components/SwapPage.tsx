import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useState } from 'react'

import { SwapFlowResult } from '../form/swapFlowResult'
import { SwapForm } from '../form/SwapForm'
import { LimitOrderReview } from '../limit/LimitOrderReview'
import { AdvancedSwapSettingsProvider } from '../state/advancedSettings'
import { FromAmountProvider } from '../state/fromAmount'
import { SwapRouteOverrideProvider } from '../state/routeOverride'
import { SwapRouteOverrideReset } from '../state/SwapRouteOverrideReset'
import { SwapVerify } from '../verify/SwapVerify'

/**
 * The swap flow. A market swap is reviewed on a sheet over the form, which
 * stays mounted underneath; a limit order still goes to its own review page,
 * since that screen carries a header of its own.
 */
export const SwapPage = () => {
  const [{ fromAmount }] = useCoreViewState<'swap'>()
  const [result, setResult] = useState<SwapFlowResult | null>(null)
  const onBack = () => setResult(null)

  return (
    <FromAmountProvider initialValue={fromAmount ?? null}>
      <AdvancedSwapSettingsProvider>
        <SwapRouteOverrideProvider initialValue={null}>
          <SwapRouteOverrideReset />
          {result?.kind === 'limit' ? (
            <LimitOrderReview {...result.order} onBack={onBack} />
          ) : (
            <>
              <SwapForm onFinish={setResult} />
              {result && (
                <SwapVerify swapQuote={result.quote} onBack={onBack} />
              )}
            </>
          )}
        </SwapRouteOverrideProvider>
      </AdvancedSwapSettingsProvider>
    </FromAmountProvider>
  )
}
