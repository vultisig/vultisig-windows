import { getTronBlockInfo } from '../../../../chains/tron/getTronBlockInfo'
import { AccountCoinKey } from '../../../../coin/AccountCoin'

export type GetTronFeeQuoteInput = {
  coin: AccountCoinKey
}

export const getTronFeeQuote = async ({ coin }: GetTronFeeQuoteInput) => {
  const blockInfo = await getTronBlockInfo(coin)
  return BigInt(blockInfo.gasFeeEstimation)
}
