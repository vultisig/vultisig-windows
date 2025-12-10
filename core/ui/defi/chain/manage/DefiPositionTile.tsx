import { Chain } from '@core/chain/Chain'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

import { DefiPosition } from '../../../storage/defiPositions'

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
  border-radius: 24px;
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

const CheckBadge = styled(IconWrapper)`
  position: absolute;
  bottom: 0;
  right: 0;
  height: 24px;
  padding: 8px;
  border-radius: 40px 0 25px 0;
  background: ${getColor('foregroundSuper')};
  font-weight: 600;
`

const getPositionIcon = (position: DefiPosition) => {
  switch (position.ticker.toUpperCase()) {
    case 'RUNE':
      return getChainLogoSrc(Chain.THORChain)
    case 'TCY':
      return `/core/images/token-icons/${knownCosmosTokens[Chain.THORChain]['tcy'].logo}`
    case 'STCY':
      return `/core/images/token-icons/${knownCosmosTokens[Chain.THORChain]['x/staking-tcy'].logo}`
    case 'RUJI':
      return `/core/images/token-icons/${knownCosmosTokens[Chain.THORChain]['x/ruji'].logo}`
    default:
      return getChainLogoSrc(position.chain)
  }
}

export const DefiPositionTile = ({
  position,
  isSelected,
  onToggle,
  isLoading,
}: Props) => {
  const icon = getPositionIcon(position)

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
        <ChainEntityIcon value={icon} style={{ fontSize: 27.5 }} />
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            <CheckmarkIcon />
          </CheckBadge>
        )}
      </PositionIconWrapper>
      <Text cropped color="contrast" size={12} weight={500}>
        {position.name}
      </Text>
    </PositionCard>
  )
}
