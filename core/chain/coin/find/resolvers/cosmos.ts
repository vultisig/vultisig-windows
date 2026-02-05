import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { FindCoinsResolver } from '@core/chain/coin/find/resolver'
import { getCosmosTokenMetadata } from '@core/chain/coin/token/metadata/resolvers/cosmos'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'

export const findCosmosCoins: FindCoinsResolver<CosmosChain> = async ({
  address,
  chain,
}) => {
  // While it should work for other cosmos chains, we only support THORChain for now
  if (chain !== CosmosChain.THORChain) return []

  const client = await getCosmosClient(chain)
  const balances = await client.getAllBalances(address)
  const coins = await Promise.all(
    without(
      balances.map(({ denom }) => denom),
      cosmosFeeCoinDenom[chain],
      tcyAutoCompounderConfig.shareDenom
    ).map(denom =>
      getCosmosTokenMetadata({ chain, id: denom })
        .then(({ ticker }) => ({ denom, ticker }))
        .catch(() => ({ denom, ticker: undefined }))
    )
  )

  return without(
    coins.map(({ denom, ticker }) => {
      const tickerAttempt = attempt(() =>
        shouldBePresent(denom.split(/[-./]/)[1]?.toUpperCase())
      )

      if ('error' in tickerAttempt) {
        console.error(`Failed to extract ticker from ${denom}`)
        return
      }

      return {
        id: denom,
        chain,
        decimals: chainFeeCoin[chain].decimals,
        ticker: ticker || tickerAttempt.data,
        logo: tickerAttempt.data.toLowerCase(),
        address,
      }
    }),
    undefined
  )
}
