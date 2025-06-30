import { InputLabel } from '@lib/ui/inputs/InputLabel'
import {
  MultiCharacterInput,
  MultiCharacterInputProps,
} from '@lib/ui/inputs/MultiCharacterInput'
import { InputProps, LabelProp } from '@lib/ui/props'

import { passcodeEncryptionConfig } from '../core/config'

type PasscodeInputProps = InputProps<string | null> &
  Partial<LabelProp> &
  Partial<Pick<MultiCharacterInputProps, 'validation' | 'validationMessages'>>

export const PasscodeInput = ({
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
        value={value}
        length={passcodeEncryptionConfig.passcodeLength}
        onChange={newValue => onChange(newValue)}
        validation={validation}
        validationMessages={validationMessages}
        includePasteButton={false}
      />
    </>
  )
}
