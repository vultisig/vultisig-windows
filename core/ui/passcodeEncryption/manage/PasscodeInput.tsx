import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { OTPInput, OTPInputProps } from '@lib/ui/inputs/OTPInput'
import { InputProps, LabelProp } from '@lib/ui/props'

import { passcodeEncryptionConfig } from '../core/config'

type PasscodeInputProps = Omit<InputProps<string | null>, 'value'> &
  Partial<LabelProp> &
  Partial<Pick<OTPInputProps, 'validation'>>

export const PasscodeInput = ({
  onChange,
  label,
  validation,
}: PasscodeInputProps) => {
  return (
    <>
      {label && <InputLabel>{label}</InputLabel>}
      <OTPInput
        length={passcodeEncryptionConfig.passcodeLength}
        onCompleted={value => onChange(value)}
        onValueChange={value =>
          onChange(
            value.length === passcodeEncryptionConfig.passcodeLength
              ? value
              : null
          )
        }
        validation={validation}
        includePasteButton={false}
      />
    </>
  )
}
