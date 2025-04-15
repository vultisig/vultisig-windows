import { Button } from '@lib/ui/buttons/Button'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode, useState } from 'react'
import styled from 'styled-components'

type Option<T extends string | number> = {
  label: string
  value: T
  icon?: ReactNode
  disabled?: boolean
}

type ToggleSwitchProps<T extends string | number> = {
  options: Option<T>[]
  selected: T
  onChange?: (value: T) => void
  disabled?: boolean
}

export const ToggleSwitch = <T extends string | number>({
  options,
  selected,
  onChange,
  disabled,
}: ToggleSwitchProps<T>) => {
  const [active, setActive] = useState(selected)

  const handleClick = (value: T) => {
    if (disabled) return
    setActive(value)
    onChange?.(value)
  }

  return (
    <Wrapper>
      {options.map(({ value, disabled, icon, label }) => (
        <ToggleButton
          key={value}
          active={active === value}
          onClick={() => handleClick(value)}
          disabled={disabled}
        >
          {icon}
          {label}
        </ToggleButton>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled(HStack)`
  border-radius: 99px;
  background-color: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  padding: 8px;
`

const ToggleButton = styled(Button)<{
  active: boolean
}>`
  flex: 1;
  padding: 6px 12px;
  background-color: ${({ active }) =>
    active ? getColor('background') : 'transparent'};
  color: ${getColor('text')};

  &:hover {
    background-color: ${({ active }) =>
      active ? getColor('background') : 'transparent'};
  }

  ${hStack({
    gap: 4,
  })};
`
