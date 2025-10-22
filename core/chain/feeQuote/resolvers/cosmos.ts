import { Chain } from '@core/chain/Chain'

import { cosmosGasRecord } from '../../chains/cosmos/gas'
import { getThorNetworkInfo } from '../../chains/cosmos/thor/getThorNetworkInfo'
import { FeeQuoteResolver } from '../resolver'

export const mayaGas = 2000000000n

export const getCosmosFeeQuote: FeeQuoteResolver<'cosmos'> = async ({
  coin: { chain },
}) => {
  if (chain === Chain.THORChain) {
    const { native_tx_fee_rune } = await getThorNetworkInfo()

    return { gas: BigInt(native_tx_fee_rune) }
  }

  if (chain === Chain.MayaChain) {
    return { gas: mayaGas }
  }

  return { gas: cosmosGasRecord[chain] }
}
