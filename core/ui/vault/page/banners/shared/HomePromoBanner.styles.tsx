import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { interactive } from '@lib/ui/css/interactive'
import { hStack, vStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import styled from 'styled-components'

/**
 * Opacity the Figma banner gradient applies to each campaign's accent hue.
 * The accent tokens themselves are stored fully opaque so they stay reusable.
 */
const accentAlpha = 0.69

/**
 * The banner surface: a single row, tappable in full. The campaign accent
 * fades in from the right over the flat base, matching the two-layer gradient
 * in Figma's "Banners NEW 2026".
 *
 * A div rather than a button, because the dismiss control sits inside it and
 * a button cannot legally nest another - the tap target is restored with the
 * button role and keyboard handling on the element itself.
 */
export const HomePromoBannerRoot = styled.div<{
  $accent: ThemeColor
}>`
  ${interactive};
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 20px 16px;
  ${borderRadius.xl};
  border: 1px solid ${getColor('foregroundExtra')};
  overflow: hidden;
  text-align: left;
  background: ${({ theme, $accent }) => {
    const base = theme.colors.foreground.toCssValue()
    const accent = theme.colors[$accent].withAlpha(accentAlpha).toCssValue()

    return `linear-gradient(90deg, ${theme.colors.foreground
      .withAlpha(accentAlpha)
      .toCssValue()} 50%, ${accent} 100%), ${base}`
  }};
`

export const HomePromoBannerContent = styled.div`
  ${hStack({ gap: 12, alignItems: 'center' })};
  position: relative;
  z-index: 2;
  width: 100%;
`

export const HomePromoBannerIconTile = styled.div`
  ${hStack({ alignItems: 'center', justifyContent: 'center' })};
  flex-shrink: 0;
  width: 41px;
  height: 41px;
  ${borderRadius.lg};
  border: 1px solid ${getColor('mist')};
  background: ${getColor('buttonSecondary')};
`

export const HomePromoBannerTextStack = styled.div`
  ${vStack({ gap: 2 })};
  flex: 1 0 0;
  min-width: 0;
  overflow-wrap: break-word;
`

// eslint-disable-next-line local/no-hardcoded-border-radius -- a glass pill, not a surface
export const HomePromoBannerCloseButton = styled(IconButton)`
  position: absolute;
  z-index: 3;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 77px;
  border: none;
  background: ${getColor('mist')};
  backdrop-filter: blur(8px);
`

/**
 * The 3D render bleeding off the banner's top-right corner. Kept behind the
 * content and inert so it never intercepts the banner's own tap. The banner
 * clips its overflow, so the art is faded out towards its left edge to avoid
 * a hard vertical seam where the clip would otherwise cut through it.
 */
export const HomePromoBannerArt = styled.img`
  position: absolute;
  z-index: 1;
  top: -9px;
  right: -29px;
  width: 125px;
  height: 125px;
  filter: blur(2px);
  mask-image: linear-gradient(90deg, transparent 0%, black 35%);
  pointer-events: none;
  user-select: none;
`
