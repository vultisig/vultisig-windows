import { CosmosChain } from '@vultisig/core-chain/Chain'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { KnownCoin } from '@vultisig/core-chain/coin/Coin'
import { knownTokensIndex } from '@vultisig/core-chain/coin/knownTokens'
import { formatUnits } from 'ethers'

import { CosmosSignDataCoin } from './getCosmosSignDataReview'

type FormatCosmosSignDataCoinInput = {
  chain: CosmosChain
  coin: CosmosSignDataCoin
}

/**
 * Formats a signed coin with its ticker and decimals when the denom is the
 * chain's fee coin or a known token, and as the raw amount and denom otherwise,
 * so an unlisted denom is never shown under another coin's ticker.
 */
export const formatCosmosSignDataCoin = ({
  chain,
  coin,
}: FormatCosmosSignDataCoinInput) => {
  const knownToken: KnownCoin | undefined = knownTokensIndex[chain][coin.denom]
  const metadata =
    coin.denom === cosmosFeeCoinDenom[chain] ? chainFeeCoin[chain] : knownToken

  if (!metadata) {
    return `${coin.amount} ${coin.denom}`
  }

  return `${formatUnits(coin.amount, metadata.decimals)} ${metadata.ticker}`
}
