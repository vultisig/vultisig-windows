import { create } from '@bufbuild/protobuf'
import { CoinSchema } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import { getTronBlockInfo } from '../../../../chains/tron/getTronBlockInfo'
import { isFeeCoin } from '../../../../coin/utils/isFeeCoin'
import { FeeQuote } from '../core'
import { FeeQuoteInput, FeeQuoteResolver } from '../resolver'

export const getTronFeeQuote: FeeQuoteResolver<'Tron'> = async (
  input: FeeQuoteInput<'Tron'>
): Promise<FeeQuote<'tron'>> => {
  const isNative = isFeeCoin(input.coin)
  const coinObject = create(CoinSchema, {
    address: input.coin.address,
    chain: input.coin.chain,
    contractAddress: input.coin.id,
    decimals: input.coin.decimals,
    hexPublicKey: '',
    isNativeToken: isNative ?? false,
    ticker: input.coin.ticker,
    logo: input.coin.logo,
    priceProviderId: input.coin.priceProviderId ?? '',
  })
  const blockInfo = await getTronBlockInfo(coinObject)
  return BigInt(blockInfo.gasFeeEstimation)
}
