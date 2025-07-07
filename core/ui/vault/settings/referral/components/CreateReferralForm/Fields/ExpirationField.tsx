import { Stepper } from '@lib/ui/base/Stepper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Controller, useFormContext } from 'react-hook-form'

import {
  FormField,
  FormFieldErrorText,
  FormFieldLabel,
} from '../../Referrals.styled'
import { ReferralFormData } from '../config'

export const ExpirationField = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ReferralFormData>()

  return (
    <VStack gap={14}>
      <FormField>
        <FormFieldLabel htmlFor="expiration">
          Set Expiration (in years)
        </FormFieldLabel>
        <Controller
          name="expiration"
          control={control}
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <Stepper
              ref={ref}
              onBlur={onBlur}
              min={1}
              max={10}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
        {errors.expiration && (
          <FormFieldErrorText>{errors.expiration.message}</FormFieldErrorText>
        )}
      </FormField>
      <HStack justifyContent="space-between" alignItems="center">
        <Text size={14} color="supporting">
          Expiration Date
        </Text>
        <Text>21 June 2026</Text>
      </HStack>
    </VStack>
  )
}
