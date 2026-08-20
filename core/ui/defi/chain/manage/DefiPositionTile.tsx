import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { shouldDisplayChainLogo } from '@core/ui/chain/coin/icon/utils/shouldDisplayChainLogo'
import { WithChainIcon } from '@core/ui/chain/coin/icon/WithChainIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

import { DefiPosition } from '../../../storage/defiPositions'
import {
  resolveDefiPositionCoin,
  resolveDefiPositionIcon,
} from '../config/defiPositionResolver'

type Props = {
  position: DefiPosition
  isSelected: boolean
  isLoading: boolean
  onToggle: () => void
}

const PositionCard = styled(UnstyledButton)<{
  isSelected: boolean
  isLoading: boolean
}>`
  ${vStack({
    gap: 11,
  })};

  width: 74px;
`

const PositionIconWrapper = styled.div<IsActiveProp>`
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
`

const DualIconWrapper = styled.div`
  position: relative;
`

export const DefiPositionTile = ({
  position,
  isSelected,
  onToggle,
  isLoading,
}: Props) => {
  const icon = resolveDefiPositionIcon(position)
  const coin = resolveDefiPositionCoin(position)

  // An LP or earn position is identified by the position, not by the token it
  // is denominated in: two Kamino vaults can share USDC, and a tile labelled
  // "USDC" twice names neither of them. Everything else is one token, where
  // the ticker is the shorter, more familiar label.
  const identifiedByName = position.type === 'lp' || position.type === 'earn'
  const label = identifiedByName
    ? position.name || position.ticker
    : (coin.ticker ?? position.name)

  const handleClick = () => {
    if (isLoading) return

    onToggle()
  }

  return (
    <PositionCard
      onClick={handleClick}
      disabled={isLoading}
      isLoading={isLoading}
      isSelected={isSelected}
    >
      <PositionIconWrapper isActive={isSelected}>
        <DualIconWrapper>
          {position.coin && shouldDisplayChainLogo(position.coin) ? (
            <WithChainIcon
              src={getChainLogoSrc(position.coin.chain)}
              style={{ fontSize: 27.5 }}
            >
              <ChainEntityIcon value={icon} />
            </WithChainIcon>
          ) : (
            <ChainEntityIcon value={icon} style={{ fontSize: 27.5 }} />
          )}
        </DualIconWrapper>
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            <CheckmarkIcon />
          </CheckBadge>
        )}
      </PositionIconWrapper>
      <Text cropped color="contrast" size={12} weight={500}>
        {label}
      </Text>
    </PositionCard>
  )
}
