import { passcodeEncryptionConfig } from '@core/ui/passcodeEncryption/core/config'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import {
  MultiCharacterInput,
  MultiCharacterInputProps,
} from '@lib/ui/inputs/MultiCharacterInput'
import { InputProps, LabelProp } from '@lib/ui/props'

type PasscodeInputProps = InputProps<string | null> &
  Partial<LabelProp> &
  Partial<
    Pick<
      MultiCharacterInputProps,
      'validation' | 'validationMessages' | 'appearance'
    >
  > & {
    autoFocus?: boolean
    length?: number
  }

/**
 * A masked numeric passcode field built on `MultiCharacterInput`, defaulting
 * to the configured passcode length and never offering a paste button.
 */
export const PasscodeInput = ({
  autoFocus = false,
  value,
  onChange,
  label,
  validation,
  validationMessages,
  appearance,
  length = passcodeEncryptionConfig.passcodeLength,
}: PasscodeInputProps) => {
  return (
    <>
      {label && <InputLabel>{label}</InputLabel>}
      <MultiCharacterInput
        appearance={appearance}
        autoFocusFirst={autoFocus}
        includePasteButton={false}
        length={length}
        onChange={newValue => onChange(newValue)}
        validation={validation}
        validationMessages={validationMessages}
        value={value}
        secureEntry
      />
    </>
  )
}
