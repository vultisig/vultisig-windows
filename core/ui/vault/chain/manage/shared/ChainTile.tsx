import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { StationCheckmarkSmallIcon } from '@lib/ui/icons/StationFigmaIcons'
import { vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css, useTheme } from 'styled-components'

type ChainTileProps = {
  iconSrc: string
  name: string
  isSelected: boolean
  onClick: () => void
  'data-testid': string
}

/** A 74px chain logo tile with its name, badged when selected. */
export const ChainTile = ({
  iconSrc,
  name,
  isSelected,
  onClick,
  'data-testid': testId,
}: ChainTileProps) => {
  const { iconStyle } = useTheme()

  return (
    <ChainCard
      data-testid={testId}
      data-selected={isSelected ? 'true' : 'false'}
      onClick={onClick}
    >
      <ChainIconWrapper isActive={isSelected}>
        <ChainEntityIcon value={iconSrc} style={{ fontSize: 27.5 }} />
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            {iconStyle === 'station' ? (
              <StationCheckmarkSmallIcon />
            ) : (
              <CheckmarkIcon />
            )}
          </CheckBadge>
        )}
      </ChainIconWrapper>
      <ChainNameWrapper>
        <ChainName color="contrast" size={12} weight={500}>
          {name}
        </ChainName>
      </ChainNameWrapper>
    </ChainCard>
  )
}

const ChainNameWrapper = styled.div`
  min-width: 0;
  width: 100%;
  text-align: center;
`

const ChainName = styled(Text)`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
`

const ChainCard = styled(UnstyledButton)`
  ${vStack({
    gap: 11,
    alignItems: 'center',
  })};

  width: 74px;
`

const ChainIconWrapper = styled.div<IsActiveProp>`
  ${vStack({
    alignItems: 'center',
    justifyContent: 'center',
  })};
  position: relative;
  align-self: stretch;
  ${borderRadius.xl};
  background: rgba(11, 26, 58, 0.5);
  height: 74px;
  padding: 17px;
  opacity: ${({ isActive }) => (isActive ? 1 : 0.5)};

  ${({ isActive }) =>
    isActive &&
    css`
      border: 1.5px solid ${getColor('foregroundSuper')};
      background: ${getColor('foreground')};
    `}

  ${({ theme, isActive }) =>
    theme.iconStyle === 'station' &&
    css`
      background: ${theme.colors.foreground.withAlpha(0.5).toCssValue()};
      opacity: ${isActive ? 1 : 0.5};

      ${isActive &&
      css`
        border: 1.5px solid ${theme.colors.foregroundExtra.toCssValue()};
        background: ${theme.colors.foreground.toCssValue()};
      `}
    `}
`

// eslint-disable-next-line local/no-hardcoded-border-radius -- a notched badge outline, not a surface radius
const CheckBadge = styled(IconWrapper)`
  position: absolute;
  bottom: 0;
  right: 0;
  height: 24px;
  padding: 8px;
  /* A notched badge shape, not a surface radius: both values exceed half
     the element and clamp, fully rounding two opposite corners. */
  border-radius: 40px 0 25px 0;
  background: ${getColor('foregroundSuper')};
  font-weight: 600;

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      background: ${theme.colors.foregroundExtra.toCssValue()};
      color: ${theme.colors.primary.toCssValue()};
    `}
`
