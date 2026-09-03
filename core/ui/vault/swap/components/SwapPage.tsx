import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { SwapFlowResult } from '../form/swapFlowResult'
import { SwapForm } from '../form/SwapForm'
import { LimitOrderReview } from '../limit/LimitOrderReview'
import { AdvancedSwapSettingsProvider } from '../state/advancedSettings'
import { FromAmountProvider } from '../state/fromAmount'
import { SwapRouteOverrideProvider } from '../state/routeOverride'
import { SwapRouteOverrideReset } from '../state/SwapRouteOverrideReset'
import { SwapVerify } from '../verify/SwapVerify'

export const SwapPage = () => {
  const [{ fromAmount }] = useCoreViewState<'swap'>()

  return (
    <FromAmountProvider initialValue={fromAmount ?? null}>
      <AdvancedSwapSettingsProvider>
        <SwapRouteOverrideProvider initialValue={null}>
          <SwapRouteOverrideReset />
          <ValueTransfer<SwapFlowResult>
            from={({ onFinish }) => <SwapForm onFinish={onFinish} />}
            to={({ value, onBack }) =>
              value.kind === 'market' ? (
                <SwapVerify swapQuote={value.quote} onBack={onBack} />
              ) : (
                <LimitOrderReview {...value.order} onBack={onBack} />
              )
            }
          />
        </SwapRouteOverrideProvider>
      </AdvancedSwapSettingsProvider>
    </FromAmountProvider>
  )
}
