import {
  BalanceValue,
  BannerContent,
  ChainTitle,
} from '@core/ui/defi/chain/banners/shared'
import { DefiFiatAmount } from '@core/ui/defi/shared/DefiFiatAmount'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { Query } from '@lib/ui/query/Query'
import { ReactNode } from 'react'
import styled from 'styled-components'

type DefiBalanceBannerProps = {
  title: string
  logo: ReactNode
  fiatQuery: Query<number>
}

/**
 * DeFi balance banner: title + fiat total stacked top-left, with the protocol
 * logo centered in a glow ring bled off the right edge. Shared by protocols like
 * VULT staking (reuses the QBTC/Terra hero layout primitives).
 */
export const DefiBalanceBanner = ({
  title,
  logo,
  fiatQuery,
}: DefiBalanceBannerProps) => (
  <Container>
    <BannerContent gap={8} style={{ alignItems: 'flex-start' }}>
      <ChainTitle>{title}</ChainTitle>
      <BalanceValue>
        <BalanceVisibilityAware>
          <DefiFiatAmount query={fiatQuery} />
        </BalanceVisibilityAware>
      </BalanceValue>
    </BannerContent>
    {logo}
  </Container>
)

const Container = styled.div`
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 122px;
  border-radius: 16px;
  border: 1px solid rgba(95, 191, 255, 0.17);
  background: linear-gradient(
    180deg,
    rgba(95, 191, 255, 0.09) 0%,
    rgba(95, 191, 255, 0) 100%
  );
`
