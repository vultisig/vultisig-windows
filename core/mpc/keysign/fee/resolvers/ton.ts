import { tonConfig } from '@core/chain/chains/ton/config'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { FeeAmountResolver } from '../resolver'

export const getTonFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const coin = getKeysignCoin(keysignPayload)

  return isFeeCoin(coin)
    ? tonConfig.baseFee
    : tonConfig.baseFee + tonConfig.jettonAmount
}
