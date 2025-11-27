import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useDefiChains, useToggleDefiChain } from '@core/ui/storage/defiChains'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

export const DefiChainItem = ({ value: chain }: ValueProp<Chain>) => {
  const defiChains = useDefiChains()
  const { toggleChain, isPending } = useToggleDefiChain()

  const isSelected = defiChains.includes(chain)

  const handleClick = () => {
    if (isPending) return
    toggleChain(chain)
  }

  return (
    <ChainCard onClick={handleClick} isLoading={isPending}>
      <ChainIconWrapper isActive={isSelected}>
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: 27.5 }}
        />
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            <CheckmarkIcon />
          </CheckBadge>
        )}
      </ChainIconWrapper>
      <Text cropped color="contrast" size={12} weight={500}>
        {chain}
      </Text>
    </ChainCard>
  )
}

const ChainCard = styled(UnstyledButton)<{ isLoading: boolean }>`
  ${vStack({
    gap: 11,
  })};

  width: 74px;
  cursor: ${({ isLoading }) => (isLoading ? 'wait' : 'pointer')};
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
`

const ChainIconWrapper = styled.div<IsActiveProp>`
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
