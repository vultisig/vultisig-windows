import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { SwapForm } from '../form/SwapForm'
import { FromAmountProvider } from '../state/fromAmount'
import { SwapVerify } from '../verify/SwapVerify'

export const SwapPage = () => {
  return (
    <FromAmountProvider initialValue={null}>
      <ValueTransfer<SwapQuote>
        from={({ onFinish }) => <SwapForm onFinish={onFinish} />}
        to={({ value, onBack }) => (
          <SwapVerify swapQuote={value} onBack={onBack} />
        )}
      />
    </FromAmountProvider>
  )
}
