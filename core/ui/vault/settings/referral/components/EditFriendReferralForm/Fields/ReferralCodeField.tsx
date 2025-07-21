import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import {
  FormField,
  FormFieldErrorText,
  FormFieldLabel,
} from '../../Referrals.styled'

export const ReferralCodeField = ({
  value,
  onChange,
  error,
}: InputProps<string> & {
  error?: string
}) => {
  const { t } = useTranslation()

  return (
    <VStack gap={14}>
      <FormField>
        <FormFieldLabel htmlFor="referral-name">
          {t('use_referral_code')}
        </FormFieldLabel>
        <HStack gap={8}>
          <TextInput
            id="referral-name"
            value={value}
            placeholder={t('enter_up_to_4_characters_placeholder')}
            onValueChange={onChange}
          />
        </HStack>
        {error && <FormFieldErrorText>{error}</FormFieldErrorText>}
      </FormField>
    </VStack>
  )
}
