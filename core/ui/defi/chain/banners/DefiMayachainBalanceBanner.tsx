import { Chain } from '@core/chain/Chain'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { Image } from '@lib/ui/image/Image'
import { Spinner } from '@lib/ui/loaders/Spinner'

import { useDefiChainPositionsQuery } from '../queries/useDefiChainPositionsQuery'
import { aggregateDefiPositions } from '../services/defiPositionAggregator'
import {
  BalanceValue,
  BannerContent,
  ChainTitle,
  MayachainBannerContainer,
  MayachainLogoWrapper,
} from './shared'

export const DefiMayachainBalanceBanner = () => {
  const chain = Chain.MayaChain
  const selectedPositions = useDefiPositions(chain)
  const formatFiatAmount = useFormatFiatAmount()
  const positionsQuery = useDefiChainPositionsQuery(chain)

  let totalFiat = 0

  const isLoading = positionsQuery.isPending

  if (positionsQuery.data) {
    const aggregates = aggregateDefiPositions({
      chain,
      selectedPositionIds: selectedPositions,
      maya: positionsQuery.data,
    })
    totalFiat = aggregates.totalFiat
  }

  return (
    <MayachainBannerContainer>
      <MayachainLogoWrapper>
        <Image src="/core/chains/mayachain.svg" width="100%" height="100%" />
      </MayachainLogoWrapper>
      <BannerContent gap={8} style={{ alignItems: 'flex-start' }}>
        <ChainTitle>{chain}</ChainTitle>
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
    </MayachainBannerContainer>
  )
}
