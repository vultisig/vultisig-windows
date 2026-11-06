import {
  settingsFieldValidation,
  settingsInputHeight,
} from '@core/ui/settings/settingsField'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import { CircleXmarkFilledIcon } from '@lib/ui/icons/CircleXmarkFilledIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { serverBackupTextInput } from './serverBackupField'
import { ServerBackupFieldHeading } from './ServerBackupFieldHeading'

const EmailInput = styled(TextInput)`
  ${serverBackupTextInput};
  ${settingsFieldValidation};
`

const ClearButton = styled(IconButton)`
  font-size: 18px;
`

const clearIconInset = 12

type EmailFieldExpandedProps = {
  registration: UseFormRegisterReturn<'email'>
  onValueChange: (value: string) => void
  onClear: () => void
  onTabForward: () => void
  error?: string
  isEmailValid: boolean
}

/** The open email field of the Server Backup form. */
export const EmailFieldExpanded = ({
  registration,
  onValueChange,
  onClear,
  onTabForward,
  error,
  isEmailValid,
}: EmailFieldExpandedProps) => {
  const { t } = useTranslation()

  return (
    <VStack gap={24}>
      <ServerBackupFieldHeading
        title={t('enter_your_email')}
        description={t('backup_email_description')}
      />
      <VStack gap={4}>
        <ActionInsideInteractiveElement
          render={() => (
            <EmailInput
              {...registration}
              onValueChange={onValueChange}
              onKeyDown={e => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault()
                  onTabForward()
                }
              }}
              placeholder={t('email')}
              validation={
                isEmailValid ? 'valid' : error ? 'invalid' : undefined
              }
              autoFocus
            />
          )}
          action={
            <ClearButton onClick={onClear}>
              <CircleXmarkFilledIcon />
            </ClearButton>
          }
          actionPlacerStyles={{
            bottom: (settingsInputHeight - iconButtonSize.md) / 2,
            right: clearIconInset,
          }}
        />
        {error && (
          <Text color="danger" size={12}>
            {error}
          </Text>
        )}
      </VStack>
    </VStack>
  )
}
