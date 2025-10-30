import { tonConfig } from '@core/chain/chains/ton/config'

import { GetFeeAmountResolver } from '../resolver'

export const getTonFeeAmount: GetFeeAmountResolver = ({
  publicKey: _publicKey,
}) => {
  return tonConfig.fee
}
