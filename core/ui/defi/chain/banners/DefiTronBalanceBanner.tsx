import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useTronAccountResourcesQuery } from '@core/ui/vault/chain/tron/useTronAccountResourcesQuery'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Chain } from '@vultisig/core-chain/Chain'
import { sunToTrx } from '@vultisig/core-chain/chains/tron/resources'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import styled from 'styled-components'

import { tronDefiCoins } from '../queries/tokens'
import {
  BalanceValue,
  BannerContent,
  ChainLogo,
  ChainTitle,
  FallbackLogo,
} from './shared'

const tronAccent = 'rgba(235, 30, 50, 0.17)'
const tronGradientStart = 'rgba(235, 30, 50, 0.09)'

const TronBannerContainer = styled.div`
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 122px;
  border-radius: 16px;
  border: 1px solid ${tronAccent};
  background: linear-gradient(
    180deg,
    ${tronGradientStart} 0%,
    rgba(17, 40, 74, 0) 100%
  );
`

const TronLogoWrapper = styled.div`
  position: absolute;
  right: 10px;
  width: 100px;
  height: 100px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.3;
`

const chain = Chain.Tron
const logoSrc = getChainLogoSrc(chain)

export const DefiTronBalanceBanner = () => {
  const formatFiatAmount = useFormatFiatAmount()
  const resourcesQuery = useTronAccountResourcesQuery()
  const pricesQuery = useCoinPricesQuery({ coins: tronDefiCoins })

  const isLoading = resourcesQuery.isPending || pricesQuery.isPending

  let totalFiat = 0

  if (resourcesQuery.data && pricesQuery.data) {
    const pendingWithdrawalSun = resourcesQuery.data.unfreezingEntries.reduce(
      (acc, entry) => acc + entry.unfreezeAmountSun,
      0n
    )
    const totalLockedTrx = sunToTrx(
      resourcesQuery.data.frozenForBandwidthSun +
        resourcesQuery.data.frozenForEnergySun +
        pendingWithdrawalSun
    )
    const trxKey = coinKeyToString(tronDefiCoins[0])
    const trxPrice = pricesQuery.data[trxKey] ?? 0
    totalFiat = totalLockedTrx * trxPrice
  }

  return (
    <TronBannerContainer>
      <TronLogoWrapper>
        <SafeImage
          src={logoSrc}
          render={props => <img {...props} width="100%" height="100%" alt="" />}
          fallback={null}
        />
      </TronLogoWrapper>
      <BannerContent gap={8} style={{ alignItems: 'flex-start' }}>
        <HStack gap={12} alignItems="center">
          <SafeImage
            src={logoSrc}
            render={props => <ChainLogo {...props} />}
            fallback={<FallbackLogo>T</FallbackLogo>}
          />
          <VStack gap={2}>
            <ChainTitle>{chain}</ChainTitle>
          </VStack>
        </HStack>
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
    </TronBannerContainer>
  )
}
