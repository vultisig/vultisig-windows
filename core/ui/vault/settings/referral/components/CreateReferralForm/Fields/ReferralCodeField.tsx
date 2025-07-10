import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useThorNameAvailabilityMutation } from '../../../mutations/useThorNameAvailabilityMutation'
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
    getValues,
  } = useFormContext<ReferralFormData>()
  const name = getValues('referralName')

  const {
    mutate: checkAvailability,
    error,
    status,
  } = useThorNameAvailabilityMutation()
  console.log('🚀 ~ ReferralCodeField ~ status:', status)

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
                placeholder={t('enter_up_to_4_characters_placeholder')}
              />
            )}
          />
          <Button
            onClick={() => {
              if (name) {
                checkAvailability(name)
              }
            }}
            style={{ maxWidth: 97, fontSize: 14 }}
          >
            {t('search')}
          </Button>
        </HStack>
        {errors.referralName && (
          <FormFieldErrorText>{errors.referralName.message}</FormFieldErrorText>
        )}
      </FormField>
      <StatusWrapper justifyContent="space-between" alignItems="center">
        <Match
          value={status}
          pending={() => (
            <CenterAbsolutely>
              <Spinner size="1.5em" />
            </CenterAbsolutely>
          )}
          error={() => (
            <>
              <Text size={14} color="supporting">
                {t('referral_status')}
              </Text>
              <StatusPill>
                <Text size={13} color="danger">
                  {extractErrorMsg(error)}
                </Text>
              </StatusPill>
            </>
          )}
          success={() => (
            <>
              <Text size={14} color="supporting">
                {t('referral_status')}
              </Text>
              <StatusPill>
                <Text size={13} color="success">
                  {t('available')}
                </Text>
              </StatusPill>
            </>
          )}
          idle={() => null}
        />
      </StatusWrapper>
    </VStack>
  )
}

const StatusWrapper = styled(HStack)`
  height: 52px;
  position: relative;
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
