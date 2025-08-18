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
    Pick<MultiCharacterInputProps, 'validation' | 'validationMessages'>
  > & {
    autoFocus?: boolean
  }

export const PasscodeInput = ({
  autoFocus = false,
  value,
  onChange,
  label,
  validation,
  validationMessages,
}: PasscodeInputProps) => {
  return (
    <>
      {label && <InputLabel>{label}</InputLabel>}
      <MultiCharacterInput
        autoFocusFirst={autoFocus}
        includePasteButton={false}
        length={passcodeEncryptionConfig.passcodeLength}
        onChange={newValue => onChange(newValue)}
        validation={validation}
        validationMessages={validationMessages}
        value={value}
      />
    </>
  )
}
