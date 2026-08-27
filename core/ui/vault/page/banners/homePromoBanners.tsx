import { BannerId } from '@core/ui/storage/dismissedBanners'
import { CircleArrowUpIcon } from '@lib/ui/icons/CircleArrowUpIcon'
import { CloudUploadIcon } from '@lib/ui/icons/CloudUploadIcon'
import { FireworksIcon } from '@lib/ui/icons/FireworksIcon'
import { TwitterIcon } from '@lib/ui/icons/TwitterIcon'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { ComponentType } from 'react'

/**
 * The banners the home carousel actually renders. Banners that live on their
 * own surface - the agent coachmark, the QBTC claim promo on the Bitcoin page -
 * share the dismissal registry but not the carousel's presentation.
 */
export type HomePromoBannerId = Exclude<
  BannerId,
  'agentNavigationCoachmark' | 'qbtcClaim'
>

/**
 * Static presentation for each home promo banner: the artwork, the accent hue
 * behind it, and what fills the icon tile. Copy lives in i18n and the tap
 * destination lives with the carousel, so this record stays free of both.
 *
 * The tile holds either a monochrome glyph tinted by `iconColor`, or a
 * partner's own multi-colour logo, which must keep its brand colours.
 */
export type HomePromoBannerVisuals = {
  accent: ThemeColor
  artSrc: string
} & (
  | { icon: ComponentType; iconColor: ThemeColor }
  | { logoSrc: string; iconColor?: never }
)

const artSrc = (name: string) => `/core/images/banner-art-${name}.png`

export const homePromoBannerVisuals: Record<
  HomePromoBannerId,
  HomePromoBannerVisuals
> = {
  migrate: {
    accent: 'bannerAccentUpgrade',
    artSrc: artSrc('upgrade'),
    icon: CircleArrowUpIcon,
    iconColor: 'info',
  },
  rujiraStaking: {
    accent: 'bannerAccentRujira',
    artSrc: artSrc('rujira'),
    logoSrc: '/core/coins/ruji.svg',
  },
  followOnX: {
    accent: 'bannerAccentFollowX',
    artSrc: artSrc('follow-x'),
    icon: TwitterIcon,
    iconColor: 'textShyExtra',
  },
  vaultBackup: {
    accent: 'bannerAccentBackup',
    artSrc: artSrc('backup'),
    icon: CloudUploadIcon,
    iconColor: 'text',
  },
  referralCode: {
    accent: 'bannerAccentReferral',
    artSrc: artSrc('referral'),
    icon: FireworksIcon,
    iconColor: 'idle',
  },
  buyVultPromo: {
    accent: 'bannerAccentBuyVult',
    artSrc: artSrc('buy-vult'),
    logoSrc: '/core/coins/vult.svg',
  },
  kamino: {
    accent: 'bannerAccentReferral',
    artSrc: artSrc('kamino'),
    logoSrc: '/core/coins/solana.svg',
  },
}
