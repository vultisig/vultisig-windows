import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { IconWrapper as BaseIconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { InputProps, IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

const IconWrapper = styled.div<IsActiveProp>`
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
  font-size: 27.5px;

  ${({ isActive }) =>
    isActive &&
    css`
      border: 1.5px solid ${getColor('foregroundSuper')};
      background: ${getColor('foreground')};
    `}
`

const CheckBadge = styled(BaseIconWrapper)`
  position: absolute;
  bottom: 0;
  right: 0;
  height: 24px;
  padding: 8px;
  border-radius: 40px 0 25px 0;
  background: ${getColor('foregroundSuper')};
  font-weight: 600;
`

const Container = styled(UnstyledButton)`
  ${vStack({
    gap: 11,
  })};

  width: 74px;
`

type SelectableItemProps = InputProps<boolean> & {
  icon: ReactNode
  name: string
}

export const SelectableItem = ({
  value: isSelected,
  onChange,
  icon,
  name,
}: SelectableItemProps) => {
  return (
    <Container onClick={() => onChange(!isSelected)}>
      <IconWrapper isActive={isSelected}>
        {icon}
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            <CheckmarkIcon />
          </CheckBadge>
        )}
      </IconWrapper>
      <Text cropped color="contrast" size={12} weight={500}>
        {name}
      </Text>
    </Container>
  )
}
