import { textInput } from '@lib/ui/css/textInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentProps, ReactNode } from 'react'
import styled, { css } from 'styled-components'

type TextAreaProps = ComponentProps<'textarea'> & {
  onValueChange?: (value: string) => void
  validation?: 'valid' | 'invalid'
  accessory?: ReactNode
}

const Container = styled(VStack)`
  position: relative;
  width: 100%;
`

const TextAreaInput = styled.textarea<{
  validation?: 'valid' | 'invalid'
}>`
  ${textInput};
  height: auto;
  min-height: 120px;
  resize: none;
  padding: 16px;
  line-height: 1.5;

  ${({ validation }) =>
    validation === 'valid'
      ? css`
          border-color: ${getColor('primary')};
          &:focus,
          &:hover {
            border-color: ${getColor('primary')};
          }
        `
      : validation === 'invalid' &&
        css`
          border-color: ${getColor('danger')};
          &:focus,
          &:hover {
            border-color: ${getColor('danger')};
          }
        `}
`

const AccessoryWr = styled(Text)`
  position: absolute;
  right: 16px;
  bottom: 16px;
  pointer-events: none;
`

export const TextArea = ({
  value,
  onValueChange,
  validation,
  accessory,
  ...props
}: TextAreaProps) => {
  return (
    <Container>
      <TextAreaInput
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        {...props}
        value={value}
        onChange={event => {
          props.onChange?.(event)
          onValueChange?.(event.target.value)
        }}
        validation={validation}
      />
      {accessory && (
        <AccessoryWr size={12} color="shy">
          {accessory}
        </AccessoryWr>
      )}
    </Container>
  )
}
