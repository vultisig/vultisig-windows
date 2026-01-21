import { Stepper } from '@lib/ui/inputs/Stepper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Controller, useFormState, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useEditReferralFormData } from '../../../../providers/EditReferralFormProvider'
import {
  FormField,
  FormFieldErrorText,
  FormFieldLabel,
} from '../../../Referrals.styled'

type Props = {
  initialExpiration: number
}

export const ExpirationField = ({ initialExpiration }: Props) => {
  const { t } = useTranslation()
  const { control } = useEditReferralFormData()
  const { errors, isDirty } = useFormState({ control })
  const expiration = useWatch({ control, name: 'expiration' })

  const formattedExpirationDate = new Date(
    new Date().setFullYear(new Date().getFullYear() + expiration)
  ).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const error =
    initialExpiration >= expiration
      ? t('expiration_must_be_greater', { value: initialExpiration })
      : errors.expiration?.message || undefined

  return (
    <VStack gap={14}>
      <FormField>
        <FormFieldLabel htmlFor="expiration">
          {t('set_expiration')}
        </FormFieldLabel>
        <Controller
          name="expiration"
          control={control}
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <Stepper
              ref={ref}
              onBlur={onBlur}
              min={1}
              max={1000}
              value={value}
              onChange={onChange}
              placeholder={t('enter_number_placeholder')}
            />
          )}
        />
        {error && isDirty && <FormFieldErrorText>{error}</FormFieldErrorText>}
      </FormField>
      <HStack justifyContent="space-between" alignItems="center">
        <Text size={14} color="supporting">
          {t('expiration_date')}
        </Text>
        <Text>{formattedExpirationDate}</Text>
      </HStack>
    </VStack>
  )
}
