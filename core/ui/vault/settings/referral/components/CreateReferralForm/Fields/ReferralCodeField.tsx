import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  FormField,
  FormFieldErrorText,
  FormFieldLabel,
} from '../../Referrals.styled'
import { ReferralFormData } from '../config'

export const ReferralCodeField = () => {
  const { t } = useTranslation()
  const {
    control,
    formState: { errors },
  } = useFormContext<ReferralFormData>()

  const status = 'available'

  return (
    <VStack gap={14}>
      <FormField>
        <FormFieldLabel htmlFor="referral-name">
          {t('pick_referral_code')}
        </FormFieldLabel>
        <HStack gap={8}>
          <Controller
            name="referralName"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                id="referral-name"
                placeholder="Enter up to 4 characters"
              />
            )}
          />
          <Button style={{ maxWidth: 97, fontSize: 14 }}>Search</Button>
        </HStack>
        {errors.referralName && (
          <FormFieldErrorText>{errors.referralName.message}</FormFieldErrorText>
        )}
      </FormField>
      <StatusWrapper justifyContent="space-between" alignItems="center">
        <Text size={14} color="supporting">
          {t('referral_status')}
        </Text>
        <StatusPill>
          <Text size={13} color={status === 'available' ? 'success' : 'danger'}>
            {t('available')}
          </Text>
        </StatusPill>
      </StatusWrapper>
    </VStack>
  )
}

const StatusWrapper = styled(HStack)`
  height: 52px;
`

const StatusPill = styled.div`
  display: flex;
  padding: 8px 12px;
  align-items: center;
  gap: 4px;
  border-radius: 99px;
  border: 1.5px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`
