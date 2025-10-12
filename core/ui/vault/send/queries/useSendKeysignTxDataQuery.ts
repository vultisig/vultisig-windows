import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { useKeysignTxDataQuery } from '../../../mpc/keysign/txData/query'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendKeysignTxDataQuery = () => {
  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()
  const [receiver] = useSendReceiver()

  return useKeysignTxDataQuery({
    coin,
    amount: shouldBePresent(amount),
    receiver,
  })
}
