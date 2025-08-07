import { textInput } from '@lib/ui/css/textInput'
import { VStack } from '@lib/ui/layout/Stack'
import { LabelProp, UiProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { ChangeEvent, ComponentProps } from 'react'
import styled, { css } from 'styled-components'

import { Spinner } from '../../loaders/Spinner'
import { InputContainer } from '../InputContainer'
import { InputLabel } from '../InputLabel'

type SharedTextInputProps = Partial<LabelProp> &
  ComponentProps<typeof TextInputContainer> & {
    onValueChange?: (value: string) => void
    isLoading?: boolean
    validation?: 'valid' | 'invalid' | 'warning'
  }

export type TextInputProps = {
  inputOverlay?: React.ReactNode
} & ComponentProps<typeof TextInputContainer> &
  SharedTextInputProps

export const TextInput = ({
  onValueChange,
  inputOverlay,
  isLoading,
  className,
  label,
  ref,
  autoComplete = 'off',
  ...props
}: TextInputProps) => {
  return (
    <InputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      <InputWr>
        {isLoading ? (
          <TextInputLoader className={className} />
        ) : (
          <TextInputContainer
            {...props}
            autoComplete={autoComplete}
            className={className}
            ref={ref}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              props.onChange?.(event)
              onValueChange?.(event.currentTarget.value)
            }}
          />
        )}
        {inputOverlay}
      </InputWr>
    </InputContainer>
  )
}

const InputWr = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const TextInputContainer = styled.input<{
  validation?: 'valid' | 'invalid' | 'warning'
}>`
  ${textInput};

  ${({ validation }) =>
    validation === 'valid'
      ? css`
          border-color: ${getColor('primary')};

          &:focus,
          &:hover {
            border-color: ${getColor('primary')};
          }
        `
      : validation === 'invalid'
        ? css`
            border-color: ${getColor('danger')};

            &:focus,
            &:hover {
              border-color: ${getColor('danger')};
            }
          `
        : validation === 'warning' &&
          css`
            border-color: ${getColor('idle')};

            &:focus,
            &:hover {
              border-color: ${getColor('idle')};
            }
          `}
`

const TextInputLoader = (props: UiProps) => (
  <TextInputContainer as="div" {...props}>
    <VStack fullHeight justifyContent="center">
      <Spinner />
    </VStack>
  </TextInputContainer>
)
