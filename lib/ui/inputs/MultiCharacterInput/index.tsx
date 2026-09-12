import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { capitalizeFirstLetter } from '@vultisig/lib-utils/capitalizeFirstLetter'
import { match } from '@vultisig/lib-utils/match'
import { ComponentPropsWithRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { borderRadius } from '../../css/borderRadius'
import { Spinner } from '../../loaders/Spinner'
import { InputProps, UiProps } from '../../props'
import { Text } from '../../text'
import { useMultiCharacterInput } from './useMultiCharacterInput'

type DigitGroupInputValidationState = 'invalid' | 'valid' | 'idle' | 'loading'
type ValidationMessages = Partial<
  Record<Exclude<DigitGroupInputValidationState, 'idle'>, string>
>

/**
 * `boxes` renders each character in a visible input box; `dots` hides the
 * inputs behind small ring indicators that fill as characters are entered,
 * the way a lock screen shows a passcode.
 */
export type MultiCharacterInputAppearance = 'boxes' | 'dots'

export type MultiCharacterInputProps = InputProps<string | null> &
  Pick<UiProps, 'className'> & {
    length: number
    validation?: DigitGroupInputValidationState
    includePasteButton?: boolean
    autoFocusFirst?: boolean
    validationMessages?: ValidationMessages
    secureEntry?: boolean
    appearance?: MultiCharacterInputAppearance
  }

/**
 * A fixed-length code entry split into one single-character input per
 * position, with paste, backspace and auto-advance handled across them.
 * `appearance="boxes"` shows the inputs; `appearance="dots"` hides them
 * behind lock-screen ring indicators that fill as characters are entered.
 */
export const MultiCharacterInput = ({
  length,
  value,
  validationMessages = {},
  onChange,
  validation = 'idle',
  includePasteButton = true,
  autoFocusFirst = true,
  className,
  secureEntry = false,
  appearance = 'boxes',
  ...rest
}: MultiCharacterInputProps) => {
  const { t } = useTranslation()
  const { digits, handleChange, handleKeyDown, handlePaste, getRefCallback } =
    useMultiCharacterInput({ length, value, onChange })

  const isDisabled = validation === 'loading'

  const derivedValidationMessages = {
    valid: validationMessages.valid ?? t('digit_input_success_validation'),
    invalid: validationMessages.invalid ?? t('digit_input_error_validation'),
    loading: validationMessages.loading ?? t('digit_input_loading_validation'),
  }

  return (
    <VStack gap={12} alignItems={appearance === 'dots' ? 'center' : undefined}>
      <DigitInputWrapper
        alignItems="center"
        gap={appearance === 'dots' ? 0 : 12}
        className={className}
      >
        {digits.map((digit, idx) => {
          const inputProps: ComponentPropsWithRef<'input'> = {
            type: secureEntry ? 'password' : 'text',
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 1,
            value: digit,
            autoFocus: autoFocusFirst && idx === 0,
            onChange: e => handleChange(e, idx),
            disabled: isDisabled,
            onKeyDown: e => handleKeyDown(e, idx),
            onPaste: handlePaste,
            ref: getRefCallback(idx),
            ...rest,
          }

          return match(appearance, {
            boxes: () => (
              <DigitInput key={idx} validation={validation} {...inputProps} />
            ),
            dots: () => (
              <DotCell key={idx}>
                <Dot validation={validation} filled={!!digit} />
                <DotInput {...inputProps} />
              </DotCell>
            ),
          })
        })}

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

const digitBoxSize = 46

// Boxes shrink evenly when the container is narrower than the full row, so the
// last box is never clipped in the 360px popup; they never grow past 46px.
const DigitInput = styled.input.attrs({
  autoComplete: 'one-time-code',
  name: 'one-time-code',
})<{
  validation: DigitGroupInputValidationState
}>`
  flex: 1 1 ${digitBoxSize}px;
  min-width: 0;
  max-width: ${digitBoxSize}px;
  aspect-ratio: 1;
  text-align: center;
  font-size: 18px;
  border: 2px solid transparent;
  background: ${getColor('foreground')};
  ${borderRadius.xl};
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

// A 35px pitch between 15px rings, with the cell tall enough to tap.
const dotCellWidth = 35
const dotCellHeight = 43
const dotSize = 15
const dotStrokeWidth = 1.5

const Dot = styled.div<{
  validation: DigitGroupInputValidationState
  filled: boolean
}>`
  width: ${dotSize}px;
  height: ${dotSize}px;
  ${borderRadius.pill};
  border: ${dotStrokeWidth}px solid;

  ${({ validation }) => {
    const color = match(validation, {
      idle: () => getColor('contrast'),
      valid: () => getColor('primary'),
      invalid: () => getColor('danger'),
      loading: () => getColor('buttonTextDisabled'),
    })

    return css`
      border-color: ${color};
      color: ${color};
    `
  }}

  ${({ filled }) =>
    filled &&
    css`
      background: currentColor;
    `}
`

// The native input over the ring is invisible, so the ring has to show which
// digit is active — the same focus treatment Checkbox gives its box.
const DotCell = styled.div`
  position: relative;
  flex-shrink: 0;
  width: ${dotCellWidth}px;
  height: ${dotCellHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:has(:focus-visible) ${Dot} {
    outline: 2px solid ${getColor('primary')};
    outline-offset: 2px;
  }
`

// Sits invisibly over its ring so clicking the ring focuses the input and the
// caret, the masking character and the browser's own styling never show.
const DotInput = styled.input.attrs({
  autoComplete: 'one-time-code',
  name: 'one-time-code',
})`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: text;
`

const PasteButton = styled(Button)`
  width: fit-content;
  ${borderRadius.xl};
  min-width: 72px;
`
