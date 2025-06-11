import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { useOtp } from '@lib/ui/inputs/OTPInput/useOTP'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

type OTPInputProps = {
  length?: number
  onCompleted?: (value: string) => void
  onValueChange?: (value: string) => void
  validation?: 'invalid' | 'valid'
  includePasteButton?: boolean
} & ComponentProps<typeof InputBoxContainer>

export const OTPInput = ({
  length = 4,
  onValueChange,
  onCompleted,
  className,
  validation,
  includePasteButton = true,
  ...props
}: OTPInputProps) => {
  const { t } = useTranslation()
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
      {includePasteButton && (
        <Button
          kind="secondary"
          onClick={() => handlePaste()}
          style={{ borderRadius: 12, width: 'auto' }}
        >
          {t('paste')}
        </Button>
      )}
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
