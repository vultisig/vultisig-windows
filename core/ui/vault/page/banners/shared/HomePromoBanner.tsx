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
}: HomePromoBannerProps) => {
  const { t } = useTranslation()

  return (
    <HomePromoBannerRoot
      $accent={accent}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={event => {
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

        <HomePromoBannerTextStack>
          <Text variant="caption" color="shy">
            {caption}
          </Text>
          <Text variant="stationBodyS" color="regular">
            {title}
          </Text>
        </HomePromoBannerTextStack>
      </HomePromoBannerContent>

      <HomePromoBannerCloseButton
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
