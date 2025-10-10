import { Chain } from '@core/chain/Chain'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { nativeTxFeeRune } from '@core/chain/tx/fee/thorchain/config'

import { FeeQuoteResolver } from '../resolver'

export const getCosmosFeeQuote: FeeQuoteResolver<'cosmos'> = async ({
  coin,
}) => {
  if (coin.chain === Chain.THORChain) {
    return { gas: BigInt(nativeTxFeeRune) }
  }
  return { gas: cosmosGasLimitRecord[coin.chain] }
}
