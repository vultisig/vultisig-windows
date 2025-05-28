import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { OTPInput } from '@lib/ui/inputs/OTPInput'
import { InputProps, LabelProp } from '@lib/ui/props'

import { passcodeLength } from '../core/config'

type PasscodeInputProps = Omit<InputProps<string | null>, 'value'> & LabelProp

export const PasscodeInput = ({ onChange, label }: PasscodeInputProps) => {
  return (
    <>
      <InputLabel>{label}</InputLabel>
      <OTPInput
        length={passcodeLength}
        onCompleted={value => onChange(value)}
        onValueChange={value =>
          onChange(value.length === passcodeLength ? value : null)
        }
      />
    </>
  )
}
