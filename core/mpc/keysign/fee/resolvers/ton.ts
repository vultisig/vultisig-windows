import { tonConfig } from '@core/chain/chains/ton/config'
import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { FeeAmountResolver } from '../resolver'

export const getTonFeeAmount = (coin: CoinKey) =>
  isFeeCoin(coin)
    ? tonConfig.baseFee
    : tonConfig.baseFee + tonConfig.jettonAmount

export const tonFeeAmountResolver: FeeAmountResolver = ({ keysignPayload }) =>
  getTonFeeAmount(getKeysignCoin(keysignPayload))
