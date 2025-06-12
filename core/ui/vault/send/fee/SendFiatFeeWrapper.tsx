import { SendChainSpecificProvider } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { SendFiatFeeValue } from '@core/ui/vault/send/fee/SendFiatFeeValue'

export const SendFiatFee = () => (
  <SendChainSpecificProvider>
    <SendFiatFeeValue />
  </SendChainSpecificProvider>
)
