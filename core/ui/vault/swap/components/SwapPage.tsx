import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { SwapForm } from '../form/SwapForm'
import { FromAmountProvider } from '../state/fromAmount'
import { SwapVerify } from '../verify/SwapVerify'

export const SwapPage = () => {
  const [{ fromAmount }] = useCoreViewState<'swap'>()

  return (
    <FromAmountProvider initialValue={fromAmount ?? null}>
      <ValueTransfer<SwapQuote>
        from={({ onFinish }) => <SwapForm onFinish={onFinish} />}
        to={({ value, onBack }) => (
          <SwapVerify swapQuote={value} onBack={onBack} />
        )}
      />
    </FromAmountProvider>
  )
}
