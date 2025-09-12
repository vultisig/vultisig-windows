import { isOneOf } from '@lib/utils/array/isOneOf'
import { match } from '@lib/utils/match'
import { getRecordKeys } from '@lib/utils/record/getRecordKeys'

import { Chain, CosmosChain, IbcEnabledCosmosChain } from '../../../../Chain'
import { cosmosGasLimitRecord } from '../../../../chains/cosmos/cosmosGasLimitRecord'
import { getThorNetworkInfo } from '../../../../chains/cosmos/thor/getThorNetworkInfo'

const defaultGas = 7500n

const ibcEnabledCosmosChainGas: Record<IbcEnabledCosmosChain, bigint> = {
  [Chain.Cosmos]: defaultGas,
  [Chain.Osmosis]: defaultGas,
  [Chain.Kujira]: defaultGas,
  [Chain.Terra]: defaultGas,
  [Chain.Dydx]: 2500000000000000n,
  [Chain.TerraClassic]: 100000000n,
  [Chain.Noble]: 30000n,
  [Chain.Akash]: 200000n,
}

export const getCosmosFeeQuote = async (chain: CosmosChain) => {
  if (isOneOf(chain, getRecordKeys(ibcEnabledCosmosChainGas))) {
    return ibcEnabledCosmosChainGas[chain]
  }

  return match(chain, {
    [Chain.THORChain]: async () => {
      const { native_tx_fee_rune } = await getThorNetworkInfo()
      return BigInt(native_tx_fee_rune)
    },
    [Chain.MayaChain]: async () => cosmosGasLimitRecord[Chain.MayaChain],
  })
}
