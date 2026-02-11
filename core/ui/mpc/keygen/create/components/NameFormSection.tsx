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
import { ReferralExpandableField } from './ReferralExpandableField'

type NameFormSectionProps = {
  isExpanded: boolean
  onToggle: () => void
  onCollapsedFocus?: () => void
  register: UseFormRegisterReturn<'name'>
  error?: string
  value: string
  onValueChange: (value: string) => void
  referralValue: string
  onReferralValueChange: (value: string) => void
}

export const NameFormSection = ({
  isExpanded,
  onToggle,
  onCollapsedFocus,
  register,
  error,
  value,
  onValueChange,
  referralValue,
  onReferralValueChange,
}: NameFormSectionProps) => {
  const { t } = useTranslation()

  return (
    <StackedField
      isOpen={isExpanded}
      renderClose={() => (
        <CollapsedFormField
          title={t('name')}
          valuePreview={value}
          isValid={!error && !!value}
          onClick={onToggle}
          onCollapsedFocus={onCollapsedFocus}
        />
      )}
      renderOpen={() => (
        <ActionInputContainer>
          <InputLabel>{t('name')}</InputLabel>
          <ActionFieldDivider />
          <VStack gap={12}>
            <VStack gap={4}>
              <Text color="contrast" size={16} weight={600}>
                {t('name_your_vault')}
              </Text>
              <Text color="shy" size={14}>
                {t('vault_name_description')}
              </Text>
            </VStack>
            <ClearableTextInput
              {...register}
              placeholder={t('enter_vault_name')}
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
            <ReferralExpandableField
              onValueChange={onReferralValueChange}
              value={referralValue}
            />
          </VStack>
        </ActionInputContainer>
      )}
    />
  )
}
