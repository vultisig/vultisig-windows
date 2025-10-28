import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { TextInput, TextInputProps } from '@lib/ui/inputs/TextInput'
import { useRef } from 'react'

import { InputPasteAction } from './InputPasteAction'

export const TextInputWithPasteAction = (props: TextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <ActionInsideInteractiveElement
      render={({ actionSize }) => (
        <TextInput
          {...props}
          ref={inputRef}
          style={{
            paddingRight: actionSize.width + textInputHorizontalPadding,
          }}
        />
      )}
      action={
        <InputPasteAction
          onPaste={value => {
            if (inputRef.current) {
              inputRef.current.value = value
              const event = new Event('input', { bubbles: true })
              inputRef.current.dispatchEvent(event)
            }
          }}
        />
      }
      actionPlacerStyles={{
        bottom: (textInputHeight - iconButtonSize.md) / 2,
        right: textInputHorizontalPadding,
      }}
    />
  )
}
