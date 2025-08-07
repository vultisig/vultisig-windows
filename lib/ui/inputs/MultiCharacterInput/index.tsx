import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { Spinner } from '../../loaders/Spinner'
import { InputProps, UiProps } from '../../props'
import { Text } from '../../text'
import { useMultiCharacterInput } from './useMultiCharacterInput'

type DigitGroupInputValidationState = 'invalid' | 'valid' | 'idle' | 'loading'
type ValidationMessages = Partial<
  Record<Exclude<DigitGroupInputValidationState, 'idle'>, string>
>

export type MultiCharacterInputProps = InputProps<string | null> &
  Pick<UiProps, 'className'> & {
    length: number
    validation?: DigitGroupInputValidationState
    includePasteButton?: boolean
    autoFocusFirst?: boolean
    validationMessages?: ValidationMessages
  }

export const MultiCharacterInput = ({
  length,
  value,
  validationMessages = {},
  onChange,
  validation = 'idle',
  includePasteButton = true,
  autoFocusFirst = true,
  className,
  ...rest
}: MultiCharacterInputProps) => {
  const { t } = useTranslation()
  const { digits, handleChange, handleKeyDown, handlePaste, inputRefs } =
    useMultiCharacterInput({ length, value, onChange })

  const isDisabled = validation === 'loading'

  const derivedValidationMessages = {
    valid: validationMessages.valid ?? t('digit_input_success_validation'),
    invalid: validationMessages.invalid ?? t('digit_input_error_validation'),
    loading: validationMessages.loading ?? t('digit_input_loading_validation'),
  }

  return (
    <VStack gap={12}>
      <DigitInputWrapper alignItems="center" gap={12} className={className}>
        {digits.map((digit, idx) => (
          <DigitInput
            key={idx}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            validation={validation}
            autoFocus={autoFocusFirst && idx === 0}
            onChange={e => handleChange(e, idx)}
            disabled={isDisabled}
            onKeyDown={e => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            ref={el => {
              inputRefs.current[idx] = el
            }}
            {...rest}
          />
        ))}

        {includePasteButton && (
          <PasteButton
            disabled={isDisabled}
            kind="secondary"
            onClick={() => handlePaste()}
          >
            {capitalizeFirstLetter(t('paste'))}
          </PasteButton>
        )}
      </DigitInputWrapper>
      {match(validation, {
        valid: () => (
          <Text size={13} color="success">
            {derivedValidationMessages.valid}
          </Text>
        ),
        invalid: () => (
          <Text size={13} color="danger">
            {derivedValidationMessages.invalid}
          </Text>
        ),
        loading: () => (
          <HStack gap={8}>
            <Spinner size={16} />
            <Text size={13} color="regular">
              {derivedValidationMessages.loading}
            </Text>
          </HStack>
        ),
        idle: () => null,
      })}
    </VStack>
  )
}

const DigitInputWrapper = styled(HStack)`
  max-width: fit-content;
`

const DigitInput = styled.input.attrs({ autoComplete: 'off' })<{
  validation: DigitGroupInputValidationState
}>`
  flex: 1;
  width: 46px;
  height: 46px;
  text-align: center;
  font-size: 18px;
  border: 2px solid transparent;
  background: ${getColor('foreground')};
  ${borderRadius.m}
  outline: none;
  color: ${getColor('text')};

  &:focus {
    border-color: ${getColor('foregroundSuper')};
  }

  ${({ validation }) =>
    match(validation, {
      valid: () => css`
        border-color: ${getColor('primary')};

        &:focus,
        &:hover {
          border-color: ${getColor('primary')};
        }
      `,
      invalid: () => css`
        border-color: ${getColor('danger')};

        &:focus,
        &:hover {
          border-color: ${getColor('danger')};
        }
      `,
      idle: () => css`
        border-color: ${getColor('foregroundExtra')};
      `,
      loading: () => css`
        border-color: transparent;
        background-color: ${getColor('buttonBackgroundDisabled')};
        color: ${getColor('buttonTextDisabled')};
      `,
    })}
`

const PasteButton = styled(Button)`
  width: fit-content;
  ${borderRadius.m};
  min-width: 72px;
`
