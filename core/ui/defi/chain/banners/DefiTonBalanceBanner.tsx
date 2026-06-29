import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useTonStakePositionQuery } from '@core/ui/chain/ton/staking/queries/useTonStakePositionQuery'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Image } from '@lib/ui/image/Image'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import styled from 'styled-components'

import { BalanceValue, BannerContent, ChainTitle } from './shared'

// TON-blue tint to match the brand, mirroring how the Tron banner tints red.
const TonBannerContainer = styled.div`
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 122px;
  border-radius: 16px;
  border: 1px solid rgba(0, 152, 234, 0.17);
  background: linear-gradient(
    180deg,
    rgba(0, 152, 234, 0.09) 0%,
    rgba(17, 40, 74, 0) 100%
  );
`

// The exported glyph already bakes in the concentric rings, so it just needs to
// be bled off the right edge and vertically centered (the Thorchain hero shape).
const TonLogoWrapper = styled.div`
  position: absolute;
  right: -24px;
  top: 50%;
  transform: translateY(-40%);
  width: 184px;
  height: 184px;
  pointer-events: none;
`

/**
 * TON DeFi hero banner. Shows the staked TON fiat value (nominator-pool stake ×
 * spot price) with the pre-composited TON brand glyph (diamond + rings,
 * exported from Figma) bled off the right edge — the same hero shape as the
 * THORChain banner.
 */
export const DefiTonBalanceBanner = () => {
  const formatFiatAmount = useFormatFiatAmount()
  const tonAddress = useCurrentVaultAddress(Chain.Ton)
  const positionQuery = useTonStakePositionQuery(tonAddress)
  const priceCoin = { ...chainFeeCoin[Chain.Ton], chain: Chain.Ton }
  const priceQuery = useCoinPricesQuery({ coins: [priceCoin] })
  const price = priceQuery.data?.[coinKeyToString({ chain: Chain.Ton })]

  // A disabled query (no TON address) stays `isPending: true` forever, so gate
  // the spinner on the address being present — otherwise the banner would spin
  // indefinitely when TON isn't derived.
  const isLoading =
    !!tonAddress && (positionQuery.isPending || priceQuery.isPending)

  const stakedUi = positionQuery.data
    ? Number(
        fromChainAmount(
          positionQuery.data.stakedAmount,
          chainFeeCoin[Chain.Ton].decimals
        )
      )
    : 0
  const totalFiat = price !== undefined ? stakedUi * price : 0

  return (
    <TonBannerContainer>
      <TonLogoWrapper>
        <Image
          src="/core/images/defi/ton-logo.svg"
          width="100%"
          height="100%"
        />
      </TonLogoWrapper>
      <BannerContent gap={8} style={{ alignItems: 'flex-start' }}>
        <ChainTitle>{Chain.Ton}</ChainTitle>
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
    </TonBannerContainer>
  )
}
