import { ComponentProps } from 'react'
import styled from 'styled-components'

import { UnstyledButton } from '../buttons/UnstyledButton'
import { borderRadius } from '../css/borderRadius'
import { CircleMinusIcon } from '../icons/CircleMinusIcon'
import { CirclePlusIcon } from '../icons/CirclePlusIcon'
import { HStack, VStack, vStack } from '../layout/Stack'
import { InputProps } from '../props'
import { getColor } from '../theme/getters'
import { TextInput } from './TextInput'

const stepperHeight = 52

type StepperProps = InputProps<number | null> & {
  min: number
  max: number
} & Partial<ComponentProps<typeof TextInput>>

/** Number field between minus and plus buttons, clamped to `min` and `max`. */
export const Stepper = ({
  value,
  onChange,
  min,
  max,
  ...rest
}: StepperProps) => {
  return (
    <Wrapper fullWidth flexGrow gap={8}>
      <StepControl
        onClick={() => {
          const newValue = value - 1

          if (newValue < min) {
            return
          }

          onChange(newValue)
        }}
      >
        <CircleMinusIcon />
      </StepControl>
      <VStack style={{ flex: '1 1 0', minWidth: 0 }}>
        <Input
          type="number"
          onValueChange={value => {
            const numValue = parseInt(value)
            onChange(isNaN(numValue) ? null : numValue)
          }}
          value={value}
          min={min}
          max={max}
          {...rest}
        />
      </VStack>
      <StepControl
        onClick={() => {
          const newValue = value + 1

          if (newValue > max) {
            return
          }

          onChange(newValue)
        }}
      >
        <CirclePlusIcon />
      </StepControl>
    </Wrapper>
  )
}

const Wrapper = styled(HStack)`
  height: ${stepperHeight}px;
`

const StepControl = styled(UnstyledButton)`
  ${vStack({
    justifyContent: 'center',
    alignItems: 'center',
  })};

  ${borderRadius.md};
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  color: ${getColor('text')};
  flex: 1 1 0;
  font-size: 20px;
`

const Input = styled(TextInput)`
  ${borderRadius.md};
  background: transparent;
  border: 1px solid ${getColor('foregroundSuper')};
  color: ${getColor('text')};
  font-size: 16px;
  font-weight: 500;
  height: ${stepperHeight}px;
  line-height: 24px;
  text-align: center;
`
