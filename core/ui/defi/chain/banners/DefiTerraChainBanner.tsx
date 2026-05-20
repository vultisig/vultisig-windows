import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'

import { DefiTerraBalanceBanner } from './DefiTerraBalanceBanner'

type DefiTerraChainBannerProps = {
  chain: IbcEnabledCosmosChain
  title: string
}

/**
 * Banner-registry wrapper. The Terra banner needs to know `chain` and a
 * display `title`, but the registry contract is `ComponentType<{}>`. This
 * wrapper closes over the props so each entry in the registry stays
 * zero-prop while the underlying banner remains reusable across chains.
 *
 * Aggregate fiat = sum(staked uluna) ÷ 10^decimals × spot price. Same
 * inputs the DeFi portfolio rollup uses, so the per-chain banner stays
 * in sync with the chain list on the previous screen.
 */
export const DefiTerraChainBanner = ({
  chain,
  title,
}: DefiTerraChainBannerProps) => {
  const delegatorAddress = useCurrentVaultAddress(chain)
  const delegationsQuery = useCosmosDelegationsQuery({
    chain,
    delegatorAddress: delegatorAddress ?? '',
  })
  const priceCoin = { ...chainFeeCoin[chain], chain }
  const priceQuery = useCoinPricesQuery({ coins: [priceCoin] })
  const price = priceQuery.data?.[coinKeyToString({ chain })]
  const decimals = chainFeeCoin[chain].decimals

  const totalFiat =
    delegationsQuery.data && price !== undefined
      ? (delegationsQuery.data.reduce(
          (acc, d) => acc + Number(d.balance.amount),
          0
        ) /
          10 ** decimals) *
        price
      : 0

  return (
    <DefiTerraBalanceBanner chain={chain} title={title} totalFiat={totalFiat} />
  )
}
