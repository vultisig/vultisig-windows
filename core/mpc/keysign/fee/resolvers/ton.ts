import { tonConfig } from '@core/chain/chains/ton/config'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { FeeAmountResolver } from '../resolver'

export const getTonFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const coin = getKeysignCoin(keysignPayload)
  const isNativeTon = isFeeCoin(coin)

  return isNativeTon
    ? tonConfig.baseFee
    : tonConfig.baseFee + tonConfig.jettonAmount
}
