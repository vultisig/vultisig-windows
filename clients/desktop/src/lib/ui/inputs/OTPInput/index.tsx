import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentProps } from 'react'
import styled, { css } from 'styled-components'

import { useOtp } from './useOTP'

interface OTPInputProps extends ComponentProps<typeof InputBoxContainer> {
  length?: number
  onCompleted?: (value: string) => void
  onValueChange?: (value: string) => void
  validation: 'invalid' | 'valid' | undefined
}

export const OTPInput = ({
  length = 4,
  onValueChange,
  onCompleted,
  className,
  validation,
  ...props
}: OTPInputProps) => {
  const { otp, handleChange, handleKeyDown, handlePaste, inputRefs } = useOtp(
    length,
    onValueChange,
    onCompleted
  )

  return (
    <HStack alignItems="center" gap={10} className={className}>
      {otp.map((data, index) => (
        <InputBoxContainer
          validation={validation}
          autoFocus={index === 0}
          key={index}
          type="text"
          value={data}
          onKeyDown={e => handleKeyDown(e, index)}
          onChange={e => handleChange(e, index)}
          onPaste={handlePaste}
          maxLength={1}
          ref={el => {
            inputRefs.current[index] = el
          }}
          {...props}
        />
      ))}
      <PasteButton onClick={() => handlePaste()}>Paste</PasteButton>
    </HStack>
  )
}

const InputBoxContainer = styled.input<{
  validation?: 'invalid' | 'valid'
}>`
  width: 46px;
  height: 46px;
  text-align: center;
  font-size: 18px;
  border: 2px solid ${getColor('foregroundExtra')};
  background-color: ${getColor('foreground')};
  ${borderRadius.m}
  outline: none;
  &:focus {
    border-color: ${getColor('foregroundSuper')};
  }
  color: ${getColor('text')};

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
        `};
`

const PasteButton = styled(Button)`
  background-color: ${getColor('foreground')};
  padding: 16px;
  cursor: pointer;
  color: ${getColor('text')};
  ${borderRadius.m}

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
