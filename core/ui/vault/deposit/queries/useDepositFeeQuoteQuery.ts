import { useFeeQuoteQuery } from '@core/ui/chain/feeQuote/query'

import { useDepositAmount } from '../hooks/useDepositAmount'
import { useDepositReceiver } from '../hooks/useDepositReceiver'
import { useDepositCoin } from '../providers/DepositCoinProvider'

export const useDepositFeeQuoteQuery = () => {
  const [coin] = useDepositCoin()

  const amount = useDepositAmount()
  const receiver = useDepositReceiver()

  return useFeeQuoteQuery({
    coin,
    receiver,
    amount,
  })
}
