import { Button, buttonSize } from '@lib/ui/buttons/Button'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode, useState } from 'react'
import styled, { css } from 'styled-components'

const StyledToggleSwitch = styled(HStack)`
  background-color: ${getColor('foregroundExtra')};
  border-radius: ${toSizeUnit(buttonSize.md)};
  padding: 8px;
`

const StyledToggleButton = styled(Button)<{ active: boolean }>`
  ${({ active, disabled }) =>
    active
      ? css`
          background-color: ${getColor('background')};
          color: ${getColor('text')};
        `
      : disabled
        ? css`
            background-color: transparent;
          `
        : css``}
  height: 44px;
`

type Option<T extends string | number> = {
  icon?: ReactNode
  label: string
  value: T
}

type ToggleSwitchProps<T extends string | number> = {
  options: Readonly<Option<T>[]>
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
    <StyledToggleSwitch gap={8}>
      {options.map(({ value, icon, label }) => {
        const isActive = active === value

        return (
          <StyledToggleButton
            active={isActive}
            disabled={isActive || disabled}
            icon={icon}
            key={value}
            kind="link"
            onClick={() => handleClick(value)}
          >
            {label}
          </StyledToggleButton>
        )
      })}
    </StyledToggleSwitch>
  )
}
