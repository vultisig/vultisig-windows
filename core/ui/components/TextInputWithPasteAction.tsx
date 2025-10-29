import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { MergeRefs } from '@lib/ui/base/MergeRefs'
import { iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { TextInput, TextInputProps } from '@lib/ui/inputs/TextInput'
import { useRef } from 'react'

import { InputPasteAction } from './InputPasteAction'

export const TextInputWithPasteAction = ({ ref, ...props }: TextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <MergeRefs
      refs={[ref, inputRef]}
      render={ref => (
        <ActionInsideInteractiveElement
          render={({ actionSize }) => (
            <TextInput
              {...props}
              ref={ref}
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
      )}
    />
  )
}
