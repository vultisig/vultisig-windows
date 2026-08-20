import { HSLA } from '@lib/ui/colors/HSLA'

export const sharedColors = {
  white: new HSLA(0, 0, 100),
  transparent: new HSLA(0, 0, 0, 0),

  // Accent hues for the home promo banners, one per campaign. These are
  // partner and campaign brand colors rather than semantic roles, so they read
  // the same in every theme and live here instead of in a per-theme palette.
  // Values are the Figma "Banners NEW 2026" gradient end stops at full
  // opacity - banners apply the design's alpha themselves via `withAlpha`.
  bannerAccentUpgrade: new HSLA(217.5, 96.84, 37.25),
  bannerAccentRujira: new HSLA(279.3, 83.33, 52.94),
  bannerAccentFollowX: new HSLA(246.94, 80.13, 29.61),
  bannerAccentBackup: new HSLA(256.22, 18.41, 39.41),
  bannerAccentReferral: new HSLA(231.92, 88.14, 23.14),
  bannerAccentBuyVult: new HSLA(220.99, 97.12, 40.78),
} as const
