import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { TextInput, TextInputProps } from '@lib/ui/inputs/TextInput'

import { InputPasteAction } from './InputPasteAction'

export const TextInputWithPasteAction = (props: TextInputProps) => (
  <ActionInsideInteractiveElement
    render={({ actionSize }) => (
      <TextInput
        {...props}
        style={{
          paddingRight: actionSize.width + textInputHorizontalPadding,
        }}
      />
    )}
    action={
      <InputPasteAction
        onPaste={value => {
          props.onValueChange?.(value)
        }}
      />
    }
    actionPlacerStyles={{
      bottom: (textInputHeight - iconButtonSize.md) / 2,
      right: textInputHorizontalPadding,
    }}
  />
)
