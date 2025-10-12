import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { useKeysignTxDataQuery } from '../../../mpc/keysign/txData/query'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendKeysignTxDataQuery = () => {
  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()

  return useKeysignTxDataQuery({
    coin,
    amount: shouldBePresent(amount),
  })
}
