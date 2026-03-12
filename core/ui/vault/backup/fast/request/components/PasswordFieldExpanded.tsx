import { ActionFieldDivider } from '@core/ui/vault/components/action-form/ActionFieldDivider'
import { ActionInputContainer } from '@core/ui/vault/components/action-form/ActionInputContainer'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type PasswordFieldExpandedProps = {
  registration: UseFormRegisterReturn<'password'>
  error?: string
}

export const PasswordFieldExpanded = ({
  registration,
  error,
}: PasswordFieldExpandedProps) => {
  const { t } = useTranslation()

  return (
    <ActionInputContainer>
      <InputLabel>{t('password')}</InputLabel>
      <ActionFieldDivider />
      <VStack gap={12}>
        <Text size={14} color="shy">
          {t('backup_password_description')}
        </Text>
        <PasswordInput
          {...registration}
          placeholder={t('enter_password')}
          error={error}
          validation={error ? 'invalid' : undefined}
        />
      </VStack>
    </ActionInputContainer>
  )
}
