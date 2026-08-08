import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useSolanaStakeAccountsQuery } from '@core/ui/chain/solana/staking/queries/useSolanaStakeAccountsQuery'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { solDecimals } from '@vultisig/core-chain/chains/solana/staking/config'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'

import {
  BalanceValue,
  BannerContainer,
  BannerContent,
  BannerLogoGlow,
  BannerLogoImage,
  ChainTitle,
} from './shared'

/**
 * Solana DeFi hero banner. Shows the total staked SOL fiat value (sum of the
 * vault's delegated stake accounts × spot price) with the Solana chain logo
 * inside a glow halo bled off the right edge — mirroring iOS
 * `DefiChainBalanceView` (chain name + staked fiat + glowing chain logo). The
 * generic fallback banner hardcodes `$0.00` and ships no logo, so Solana gets
 * this dedicated banner instead.
 */
export const DefiSolanaBalanceBanner = () => {
  const formatFiatAmount = useFormatFiatAmount()
  const coins = useCurrentVaultCoins()

  const solCoin = coins.find(c => c.chain === Chain.Solana && !c.id)
  const owner = solCoin?.address ?? ''

  const stakeAccountsQuery = useSolanaStakeAccountsQuery(owner)
  const pricesQuery = useCoinPricesQuery({
    coins: solCoin
      ? [{ ...chainFeeCoin[Chain.Solana], chain: Chain.Solana }]
      : [],
  })

  const priceUsd =
    pricesQuery.data?.[coinKeyToString({ chain: Chain.Solana })] ?? 0

  const totalStaked = (stakeAccountsQuery.data ?? [])
    .filter(account => account.delegation !== undefined)
    .reduce(
      (sum, account) =>
        sum +
        Number(fromChainAmount(account.delegation?.stake ?? 0n, solDecimals)),
      0
    )

  const totalFiat = totalStaked * priceUsd

  const isLoading =
    !!solCoin && (stakeAccountsQuery.isPending || pricesQuery.isPending)

  return (
    <BannerContainer>
      <BannerLogoGlow>
        <BannerLogoImage src={getChainLogoSrc(Chain.Solana)} />
      </BannerLogoGlow>
      <BannerContent gap={8} style={{ alignItems: 'flex-start' }}>
        <ChainTitle>{Chain.Solana}</ChainTitle>
        {isLoading ? (
          <Spinner size={20} />
        ) : (
          <BalanceValue>
            <BalanceVisibilityAware>
              {formatFiatAmount(totalFiat)}
            </BalanceVisibilityAware>
          </BalanceValue>
        )}
      </BannerContent>
    </BannerContainer>
  )
}
