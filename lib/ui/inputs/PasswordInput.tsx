import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { EyeIcon } from '@lib/ui/icons/EyeIcon'
import { EyeOffIcon } from '@lib/ui/icons/EyeOffIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { ComponentPropsWithoutRef } from 'react'

export const PasswordInput: React.FC<
  ComponentPropsWithoutRef<typeof TextInput>
> = ({ ...rest }) => {
  const [shouldHideValue, { toggle }] = useBoolean(true)

  return (
    <ActionInsideInteractiveElement
      render={({ actionSize }) => (
        <TextInput
          type={shouldHideValue ? 'password' : 'text'}
          autoComplete="off"
          spellCheck="false"
          {...rest}
          style={{
            paddingRight: actionSize.width + textInputHorizontalPadding,
          }}
        />
      )}
      action={
        <IconButton onClick={toggle}>
          {shouldHideValue ? <EyeOffIcon /> : <EyeIcon />}
        </IconButton>
      }
      actionPlacerStyles={{
        bottom: (textInputHeight - iconButtonSize.md) / 2,
        right: textInputHorizontalPadding,
      }}
    />
  )
}
