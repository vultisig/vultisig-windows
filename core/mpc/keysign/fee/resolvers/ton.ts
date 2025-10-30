import { tonConfig } from '@core/chain/chains/ton/config'

import { GetFeeAmountResolver } from '../resolver'

export const getTonFeeAmount: GetFeeAmountResolver<'ton'> = () => {
  return tonConfig.fee
}
