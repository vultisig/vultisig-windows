import { Stepper } from '@lib/ui/inputs/Stepper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useCreateReferralForm } from '../../../../providers/CreateReferralFormProvider'
import {
  FormField,
  FormFieldErrorText,
  FormFieldLabel,
} from '../../../Referrals.styled'

export const ExpirationField = () => {
  const { t } = useTranslation()
  const {
    control,
    formState: { errors },
  } = useCreateReferralForm()

  const expiration =
    useWatch({
      control,
      name: 'expiration',
    }) ?? 1

  const formattedExpirationDate = new Date(
    new Date().setFullYear(new Date().getFullYear() + expiration)
  ).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
        {errors.expiration && (
          <FormFieldErrorText>{errors.expiration.message}</FormFieldErrorText>
        )}
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
