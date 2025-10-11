import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { useFeeQuoteQuery } from '../../../chain/fee-quote/query'
import { useSendAmount } from '../state/amount'
import { useSendMemo } from '../state/memo'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendFeeQuoteQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [amount] = useSendAmount()
  const [memo] = useSendMemo()

  return useFeeQuoteQuery({
    coin,
    receiver,
    amount: shouldBePresent(amount),
    data: memo,
  })
}
