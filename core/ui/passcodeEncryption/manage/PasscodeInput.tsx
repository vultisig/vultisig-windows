import {
  DigitGroupInput,
  DigitGroupInputProps,
} from '@lib/ui/inputs/DigitGroupInput'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { InputProps, LabelProp } from '@lib/ui/props'

import { passcodeEncryptionConfig } from '../core/config'

type PasscodeInputProps = InputProps<string | null> &
  Partial<LabelProp> &
  Partial<Pick<DigitGroupInputProps, 'validation' | 'validationMessages'>>

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
      <DigitGroupInput
        value={value}
        length={passcodeEncryptionConfig.passcodeLength}
        onCompleted={value => onChange(value)}
        onChange={newValue =>
          onChange(
            newValue?.length === passcodeEncryptionConfig.passcodeLength
              ? newValue
              : null
          )
        }
        validation={validation}
        validationMessages={validationMessages}
        includePasteButton={false}
      />
    </>
  )
}
