import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { Text } from '@lib/ui/text'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  HomePromoBannerArt,
  HomePromoBannerCloseButton,
  HomePromoBannerContent,
  HomePromoBannerIconTile,
  HomePromoBannerRoot,
  HomePromoBannerTextStack,
} from './HomePromoBanner.styles'

type HomePromoBannerProps = {
  caption: string
  title: string
  icon: ReactNode
  accent: ThemeColor
  artSrc: string
  onClick: () => void
  onDismiss: () => void
  testId?: string
  isExtension?: boolean
}

/**
 * The shared home carousel promo surface: an icon tile, a caption/title pair,
 * a 3D render bleeding off the right edge, and a glass close pill. The whole
 * banner is the tap target - dismissing is the only competing action, so its
 * click is kept from bubbling into the banner's own.
 */
export const HomePromoBanner = ({
  caption,
  title,
  icon,
  accent,
  artSrc,
  onClick,
  onDismiss,
  testId,
  isExtension = false,
}: HomePromoBannerProps) => {
  const { t } = useTranslation()

  return (
    <HomePromoBannerRoot
      $accent={accent}
      $isExtension={isExtension}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={event => {
        // The dismiss button sits inside the banner, so its own Enter/Space
        // would otherwise bubble up here and open the campaign as well.
        if (event.target !== event.currentTarget) {
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      data-testid={testId}
    >
      <HomePromoBannerArt src={artSrc} alt="" aria-hidden decoding="async" />

      <HomePromoBannerContent>
        <HomePromoBannerIconTile>{icon}</HomePromoBannerIconTile>

        <HomePromoBannerTextStack
          $isExtension={isExtension}
          data-testid="home-promo-banner-text"
        >
          <Text variant="caption" color="shy">
            {caption}
          </Text>
          <Text variant="stationBodyS" color="regular">
            {title}
          </Text>
        </HomePromoBannerTextStack>
      </HomePromoBannerContent>

      <HomePromoBannerCloseButton
        $isExtension={isExtension}
        size="lg"
        aria-label={t('close')}
        onClick={event => {
          event.stopPropagation()
          onDismiss()
        }}
      >
        <CrossIcon style={{ fontSize: 16 }} />
      </HomePromoBannerCloseButton>
    </HomePromoBannerRoot>
  )
}
