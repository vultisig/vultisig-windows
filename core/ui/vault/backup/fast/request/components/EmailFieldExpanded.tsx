import { ActionFieldDivider } from '@core/ui/vault/components/action-form/ActionFieldDivider'
import { ActionInputContainer } from '@core/ui/vault/components/action-form/ActionInputContainer'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { CircleCrossIcon } from '@lib/ui/icons/CircleCrossIcon'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type EmailFieldExpandedProps = {
  registration: UseFormRegisterReturn<'email'>
  onValueChange: (value: string) => void
  onClear: () => void
  error?: string
  isEmailValid: boolean
}

export const EmailFieldExpanded = ({
  registration,
  onValueChange,
  onClear,
  error,
  isEmailValid,
}: EmailFieldExpandedProps) => {
  const { t } = useTranslation()

  return (
    <ActionInputContainer>
      <InputLabel>{t('enter')}</InputLabel>
      <ActionFieldDivider />
      <VStack gap={12}>
        <Text size={14} color="shy">
          {t('backup_email_description')}
        </Text>
        <VStack gap={4}>
          <ActionInsideInteractiveElement
            render={() => (
              <TextInput
                {...registration}
                onValueChange={onValueChange}
                placeholder={t('email')}
                validation={
                  isEmailValid ? 'valid' : error ? 'invalid' : undefined
                }
                autoFocus
              />
            )}
            action={
              <IconButton onClick={onClear}>
                <CircleCrossIcon />
              </IconButton>
            }
            actionPlacerStyles={{
              bottom: (textInputHeight - iconButtonSize.md) / 2,
              right: textInputHorizontalPadding,
            }}
          />
          {error && (
            <Text color="danger" size={12}>
              {error}
            </Text>
          )}
        </VStack>
      </VStack>
    </ActionInputContainer>
  )
}
