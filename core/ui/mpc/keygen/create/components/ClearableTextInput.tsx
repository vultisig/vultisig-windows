import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { CircleCrossFilledIcon } from '@lib/ui/icons/CircleCrossFilledIcon'
import { TextInput, TextInputProps } from '@lib/ui/inputs/TextInput'

type ClearableTextInputProps = TextInputProps & {
  onClear: () => void
}

export const ClearableTextInput = ({
  onClear,
  onValueChange,
  ...props
}: ClearableTextInputProps) => {
  return (
    <ActionInsideInteractiveElement
      render={() => <TextInput {...props} onValueChange={onValueChange} />}
      action={
        <IconButton tabIndex={-1} onClick={onClear}>
          <CircleCrossFilledIcon />
        </IconButton>
      }
      actionPlacerStyles={{
        bottom: (textInputHeight - iconButtonSize.md) / 2,
        right: textInputHorizontalPadding,
      }}
    />
  )
}
