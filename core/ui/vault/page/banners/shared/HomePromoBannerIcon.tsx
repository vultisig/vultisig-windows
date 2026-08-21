import { hStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import styled from 'styled-components'

import { HomePromoBannerVisuals } from '../homePromoBanners'

const iconSize = 20

const Logo = styled.img`
  width: ${iconSize}px;
  height: ${iconSize}px;
`

const Glyph = styled.span<{ $color: ThemeColor }>`
  ${hStack({ alignItems: 'center' })};
  font-size: ${iconSize}px;
  color: ${({ $color }) => getColor($color)};
`

type HomePromoBannerIconProps = {
  visuals: HomePromoBannerVisuals
}

/**
 * Fills a banner's icon tile: a partner logo keeps its own brand colours,
 * while a plain glyph is tinted to the shade the design gives that banner.
 */
export const HomePromoBannerIcon = ({ visuals }: HomePromoBannerIconProps) => {
  if ('logoSrc' in visuals) {
    return <Logo src={visuals.logoSrc} alt="" aria-hidden decoding="async" />
  }

  const { icon: Icon, iconColor } = visuals

  return (
    <Glyph $color={iconColor}>
      <Icon />
    </Glyph>
  )
}
