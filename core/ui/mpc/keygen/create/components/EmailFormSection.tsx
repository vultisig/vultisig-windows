import { FormExpandableSection } from '@lib/ui/form/FormExpandableSection'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ClearableTextInput } from './ClearableTextInput'

type EmailFormSectionProps = {
  isExpanded: boolean
  onToggle: () => void
  register: UseFormRegisterReturn<'email'>
  error?: string
  value: string
  onValueChange: (value: string) => void
}

export const EmailFormSection = ({
  isExpanded,
  onToggle,
  register,
  error,
  value,
  onValueChange,
}: EmailFormSectionProps) => {
  const { t } = useTranslation()

  return (
    <FormExpandableSection
      title={t('email')}
      isExpanded={isExpanded}
      isValid={!error && !!value}
      valuePreview={value}
      onToggle={onToggle}
    >
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
    </FormExpandableSection>
  )
}
