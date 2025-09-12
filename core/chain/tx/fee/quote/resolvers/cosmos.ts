import { CosmosChain } from '../../../../Chain'
import { cosmosGasLimitRecord } from '../../../../chains/cosmos/cosmosGasLimitRecord'
import { nativeTxFeeRune } from '../../thorchain/config'
import { FeeQuote } from '../core'
import { FeeQuoteInput, FeeQuoteResolver } from '../resolver'

export const getCosmosFeeQuote: FeeQuoteResolver<CosmosChain> = async (
  input: FeeQuoteInput<CosmosChain>
): Promise<FeeQuote<'cosmos'>> => {
  const chain = input.coin.chain as CosmosChain
  if (chain === 'THORChain') {
    return BigInt(nativeTxFeeRune)
  }
  if (chain === 'MayaChain') {
    return cosmosGasLimitRecord['MayaChain']
  }

  const defaultGasRecord = {
    Cosmos: 7500,
    Osmosis: 7500,
    Kujira: 7500,
    Terra: 7500,
    Dydx: 2500000000000000,
    TerraClassic: 100000000,
    Noble: 30000,
    Akash: 200000,
  } as const

  return BigInt(defaultGasRecord[chain as keyof typeof defaultGasRecord])
}
