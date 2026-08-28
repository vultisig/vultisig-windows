import { CollapsingBalance } from '@core/ui/page/CollapsingBalance'
import { useCore } from '@core/ui/state/core'
import { Wrap } from '@lib/ui/base/Wrap'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ChildrenProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { getColor } from '@lib/ui/theme/getters'
import { areEmptyChildren } from '@lib/ui/utils/areEmptyChildren'
import { RefObject } from 'react'
import styled, { css } from 'styled-components'

import { VaultTotalBalance } from '../balance/VaultTotalBalance'
import { BannerCarousel } from '../banners/BannerCarousel/BannerCarousel'
import { useHomePromoBanners } from '../banners/useHomePromoBanners'
import { VaultOverviewPrimaryActions } from './VaultOverviewPrimaryActions'
import { VaultTabs } from './VaultTabs/VaultTabs'

const PromptsContainer = styled.div<{ $isExtension: boolean }>`
  margin-top: 12px;
  ${vStack({ gap: 20 })};

  ${({ $isExtension }) => !$isExtension && `padding-inline: 20px;`}
`

const PromptsWrapper = ({ children }: ChildrenProp) => {
  const { client } = useCore()

  return areEmptyChildren(children) ? null : (
    <PromptsContainer $isExtension={client === 'extension'}>
      {children}
    </PromptsContainer>
  )
}

type VaultOverviewProps = {
  scrollContainerRef: RefObject<HTMLDivElement>
}

/**
 * The vault home screen: total balance, primary actions, the promo carousel
 * and the asset tabs. The scroll container is owned here but shared with
 * `CollapsingBalance`, which collapses the balance as that container scrolls.
 */
export const VaultOverview = ({ scrollContainerRef }: VaultOverviewProps) => {
  const { client } = useCore()
  const isExtension = client === 'extension'
  const banners = useHomePromoBanners()

  return (
    <Container flexGrow data-testid="vault-overview">
      <StyledPageContent
        $isExtension={isExtension}
        ref={scrollContainerRef}
        scrollable
        gap={32}
        flexGrow
      >
        <BlurEffect />
        <BalanceWrapper
          $isExtension={isExtension}
          data-testid="vault-overview-balance-wrapper"
        >
          <CollapsingBalance scrollContainerRef={scrollContainerRef}>
            <VaultTotalBalance />
          </CollapsingBalance>
          <VaultOverviewPrimaryActions />
        </BalanceWrapper>
        <Wrap wrap={PromptsWrapper}>
          <BannerCarousel banners={banners} />
        </Wrap>
        <Divider $isExtension={isExtension} />
        <VaultTabs />
      </StyledPageContent>
    </Container>
  )
}

const Container = styled(VStack)`
  min-height: 0;
`

const StyledPageContent = styled(PageContent)<{ $isExtension: boolean }>`
  ${hideScrollbars};
  position: relative;

  ${({ $isExtension, theme }) =>
    $isExtension
      ? css`
          gap: 20px;
          padding-top: 32px;
        `
      : theme.iconStyle === 'station' &&
        css`
          gap: 20px;
          padding-top: 24px;
        `}
`

const BalanceWrapper = styled.div<{ $isExtension: boolean }>`
  position: relative;

  ${({ $isExtension, theme }) =>
    $isExtension
      ? css`
          ${vStack({ alignItems: 'center', gap: 32 })};
          flex-shrink: 0;
          height: 178px;
          min-height: 178px;
          max-height: 178px;
        `
      : css`
          ${vStack({ alignItems: 'center', gap: 24 })};

          ${theme.iconStyle === 'station' &&
          css`
            gap: 20px;
          `}
        `}
`

// eslint-disable-next-line local/no-hardcoded-border-radius -- a decorative glow, not a surface
const BlurEffect = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  ${borderRadius.lg};
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

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      display: none;
    `}
`

const Divider = styled.div<{ $isExtension: boolean }>`
  align-self: stretch;

  ${({ $isExtension, theme }) =>
    $isExtension
      ? css`
          height: 0;

          &::after {
            content: '';
            display: block;
            height: 1px;
            background: ${getColor('foregroundExtra')};
          }

          ${theme.iconStyle === 'station' &&
          css`
            &::after {
              background: ${theme.colors.foregroundSuper.toCssValue()};
            }
          `}
        `
      : css`
          height: 1px;
          background: ${getColor('foregroundExtra')};

          ${theme.iconStyle === 'station' &&
          css`
            background: ${theme.colors.foregroundSuper.toCssValue()};
          `}
        `}
`
