import { ActionFieldDivider } from '@core/ui/vault/components/action-form/ActionFieldDivider'
import { ActionInputContainer } from '@core/ui/vault/components/action-form/ActionInputContainer'
import { StackedField } from '@core/ui/vault/send/StackedField'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ClearableTextInput } from './ClearableTextInput'
import { CollapsedFormField } from './CollapsedFormField'

type EmailFormSectionProps = {
  isExpanded: boolean
  onToggle: () => void
  onCollapsedFocus?: () => void
  register: UseFormRegisterReturn<'email'>
  error?: string
  value: string
  onValueChange: (value: string) => void
}

export const EmailFormSection = ({
  isExpanded,
  onToggle,
  onCollapsedFocus,
  register,
  error,
  value,
  onValueChange,
}: EmailFormSectionProps) => {
  const { t } = useTranslation()

  return (
    <StackedField
      isOpen={isExpanded}
      renderClose={() => (
        <CollapsedFormField
          title={t('email')}
          valuePreview={value}
          isValid={!error && !!value}
          onClick={onToggle}
          onCollapsedFocus={onCollapsedFocus}
        />
      )}
      renderOpen={() => (
        <ActionInputContainer>
          <InputLabel>{t('email')}</InputLabel>
          <ActionFieldDivider />
          <VStack gap={12}>
            <VStack gap={4}>
              <Text color="contrast" size={16} weight={600}>
                {t('fastVaultSetup.enterEmail')}
              </Text>
              <Text color="shy" size={14}>
                {t('fastVaultSetup.emailSetupTitle')}
              </Text>
            </VStack>
            <ClearableTextInput
              {...register}
              placeholder={t('email')}
              value={value}
              onValueChange={onValueChange}
              onClear={() => onValueChange('')}
              validation={error ? 'invalid' : undefined}
            />
            {error && (
              <Text color="danger" size={12}>
                {error}
              </Text>
            )}
          </VStack>
        </ActionInputContainer>
      )}
    />
  )
}
