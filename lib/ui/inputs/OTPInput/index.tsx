import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { InputProps } from '../../props'
import { useOtp } from './useOTP'

export type OTPInputProps = InputProps<string | null> & {
  length?: number
  validation?: 'invalid' | 'valid'
  includePasteButton?: boolean
  autoFocusFirst?: boolean
} & ComponentProps<typeof DigitInput>

export const OTPInput = ({
  length = 4,
  value,
  onChange,
  validation,
  includePasteButton = true,
  autoFocusFirst = true,
  className,
  ...rest
}: OTPInputProps) => {
  const { t } = useTranslation()
  const { chars, handleChange, handleKeyDown, handlePaste, inputRefs } = useOtp(
    { length, value, onChange }
  )

  return (
    <HStack alignItems="center" gap={12} className={className}>
      {chars.map((c, i) => (
        <DigitInput
          key={i}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={c}
          validation={validation}
          autoFocus={autoFocusFirst && i === 0}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          ref={el => {
            inputRefs.current[i] = el
          }}
          {...rest}
        />
      ))}

      {includePasteButton && (
        <Button
          kind="secondary"
          onClick={() => handlePaste()}
          style={{ borderRadius: 12, minWidth: 72 }}
        >
          {t('paste')}
        </Button>
      )}
    </HStack>
  )
}

const DigitInput = styled.input<{ validation?: 'invalid' | 'valid' }>`
  flex: 1;
  min-width: 46px;
  height: 46px;
  text-align: center;
  font-size: 18px;
  border: 2px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  ${borderRadius.m}
  outline: none;
  color: ${getColor('text')};

  &:focus {
    border-color: ${getColor('foregroundSuper')};
  }

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
