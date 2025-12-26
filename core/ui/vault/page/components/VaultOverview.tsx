import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Wrap } from '@lib/ui/base/Wrap'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ChildrenProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { getColor } from '@lib/ui/theme/getters'
import { areEmptyChildren } from '@lib/ui/utils/areEmptyChildren'
import { RefObject } from 'react'
import styled from 'styled-components'

import { VaultTotalBalance } from '../balance/VaultTotalBalance'
import { BannerCarousel } from '../banners/BannerCarousel/BannerCarousel'
import { FollowOnXBanner } from '../banners/FollowOnXBanner/FollowOnXBanner'
import { MigrateVaultPrompt } from '../keygen/migrate/MigrateVaultPrompt'
import { VaultOverviewPrimaryActions } from './VaultOverviewPrimaryActions'
import { VaultTabs } from './VaultTabs/VaultTabs'

const PromptsContainer = styled.div`
  padding-inline: 20px;
  margin-top: 12px;
  ${vStack({ gap: 20 })};
`

const PromptsWrapper = ({ children }: ChildrenProp) => {
  return areEmptyChildren(children) ? null : (
    <PromptsContainer>{children}</PromptsContainer>
  )
}

type VaultOverviewProps = {
  scrollContainerRef: RefObject<HTMLDivElement>
}

export const VaultOverview = ({ scrollContainerRef }: VaultOverviewProps) => {
  const { libType } = useCurrentVault()

  const banners = [
    ...(libType !== 'DKLS'
      ? [
          {
            id: 'migrate' as const,
            component: (props: { onDismiss: () => void }) => (
              <MigrateVaultPrompt onDismiss={props.onDismiss} />
            ),
          },
        ]
      : []),
    {
      id: 'followOnX' as const,
      component: (props: { onDismiss: () => void }) => (
        <FollowOnXBanner onDismiss={props.onDismiss} />
      ),
    },
  ]

  return (
    <VStack fullHeight>
      <StyledPageContent ref={scrollContainerRef} scrollable gap={32} flexGrow>
        <BlurEffect />
        <BalanceWrapper data-testid="vault-overview-balance-wrapper">
          <VaultTotalBalance />
          <VaultOverviewPrimaryActions />
        </BalanceWrapper>
        <Wrap wrap={PromptsWrapper}>
          <BannerCarousel banners={banners} />
        </Wrap>
        <Divider />
        <VaultTabs />
      </StyledPageContent>
    </VStack>
  )
}

const StyledPageContent = styled(PageContent)`
  ${hideScrollbars};
  position: relative;
`

const BalanceWrapper = styled.div`
  ${vStack({ alignItems: 'center', gap: 24 })};
  position: relative;
`

const BlurEffect = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 16px;
  border-radius: 350px;
  height: 200px;
  top: -25px;
  width: 350px;
  opacity: 0.7;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(4, 57, 199, 0.5) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  filter: blur(36px);

  @media ${mediaQuery.tabletDeviceAndUp} {
    height: 250px;
    width: 600px;
    top: -25px;
  }
`

const Divider = styled.div`
  height: 1px;
  align-self: stretch;
  background: ${getColor('foregroundExtra')};
`
