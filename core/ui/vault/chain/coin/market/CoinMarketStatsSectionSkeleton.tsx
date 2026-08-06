import { HStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { TitleProp } from '@lib/ui/props'
import styled from 'styled-components'

import { CoinDetailSection } from './CoinDetailSection'

/**
 * Shimmer placeholder shown while the market stats load, matching the
 * section card's footprint.
 */
export const CoinMarketStatsSectionSkeleton = ({ title }: TitleProp) => (
  <CoinDetailSection title={title}>
    {Array.from({ length: 3 }, (_, index) => (
      <SkeletonRow key={index}>
        <Skeleton width="88px" height="14px" />
        <Skeleton width="64px" height="14px" />
      </SkeletonRow>
    ))}
  </CoinDetailSection>
)

const SkeletonRow = styled(HStack)`
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
`
