import { useCore } from '@core/ui/state/core'
import { Wrap } from '@lib/ui/base/Wrap'
import { vStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { areEmptyChildren } from '@lib/ui/utils/areEmptyChildren'
import styled, { css } from 'styled-components'

import { BannerCarousel } from '../page/banners/BannerCarousel/BannerCarousel'
import { useHomePromoBanners } from '../page/banners/useHomePromoBanners'
import { VaultTabs } from '../page/components/VaultTabs/VaultTabs'
import { HomeHeaderSlot } from './HomeHeaderSlot'
import { HomePageContent } from './HomePageContent'
import { useHomePageScrollRef } from './useHomePageScrollRef'

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

/**
 * The home's Wallet page: the room for the shared header, the promo carousel
 * and the asset tabs.
 */
export const WalletHomePage = () => {
  const { client } = useCore()
  const isExtension = client === 'extension'
  const banners = useHomePromoBanners()
  const scrollRef = useHomePageScrollRef('wallet')

  return (
    <HomePageContent
      ref={scrollRef}
      $isExtension={isExtension}
      scrollable
      gap={32}
      flexGrow
      data-testid="vault-page"
    >
      <HomeHeaderSlot />
      <Wrap wrap={PromptsWrapper}>
        <BannerCarousel banners={banners} />
      </Wrap>
      <Divider $isExtension={isExtension} />
      <VaultTabs />
    </HomePageContent>
  )
}

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
