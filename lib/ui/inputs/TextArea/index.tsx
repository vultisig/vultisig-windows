import { textInput } from '@lib/ui/css/textInput'
import { VStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

type TextAreaProps = InputProps<string> & {
  validation?: 'valid' | 'invalid'
  accessory?: ReactNode
  placeholder?: string
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
  text-transform: lowercase;

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
  onChange,
  validation,
  accessory,
  placeholder,
  ...props
}: TextAreaProps) => {
  return (
    <Container>
      <TextAreaInput
        {...props}
        value={value}
        onChange={event => onChange(event.target.value)}
        validation={validation}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
      />
      {accessory && (
        <AccessoryWr size={12} color="shy">
          {accessory}
        </AccessoryWr>
      )}
    </Container>
  )
}
