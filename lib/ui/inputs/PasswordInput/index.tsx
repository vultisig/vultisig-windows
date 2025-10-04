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
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { ComponentPropsWithoutRef } from 'react'

import { ActionInsideInteractiveElement } from '../../base/ActionInsideInteractiveElement'

export const PasswordInput: React.FC<
  ComponentPropsWithoutRef<typeof TextInput> & {
    error?: string
  }
> = ({ error, ...rest }) => {
  const [shouldHideValue, { toggle }] = useBoolean(true)

  return (
    <VStack gap={4}>
      <ActionInsideInteractiveElement
        render={({ actionSize }) => (
          <TextInput
            {...rest}
            spellCheck="false"
            type={shouldHideValue ? 'password' : 'text'}
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
          right: textInputHorizontalPadding,
          bottom: (textInputHeight - iconButtonSize.md) / 2,
        }}
      />
      {error && (
        <Text color="danger" size={12}>
          {error}
        </Text>
      )}
    </VStack>
  )
}
