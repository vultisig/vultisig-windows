import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { Image } from '@lib/ui/image/Image'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Chain } from '@vultisig/core-chain/Chain'

import { useDefiChainPositionsQuery } from '../queries/useDefiChainPositionsQuery'
import { aggregateDefiPositions } from '../services/defiPositionAggregator'
import { DefiBannerBalance } from './DefiBannerBalance'
import {
  BannerContent,
  ChainTitle,
  MayachainBannerContainer,
  MayachainLogoWrapper,
} from './shared'

export const DefiMayachainBalanceBanner = () => {
  const chain = Chain.MayaChain
  const selectedPositions = useDefiPositions(chain)
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
          <DefiBannerBalance chain={chain} value={totalFiat} />
        )}
      </BannerContent>
    </MayachainBannerContainer>
  )
}
