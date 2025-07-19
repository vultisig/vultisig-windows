import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useThorNameAvailabilityMutation } from '../../../../mutations/useThorNameAvailabilityMutation'
import {
  FormField,
  FormFieldErrorText,
  FormFieldLabel,
} from '../../../Referrals.styled'
import { CreateReferralFormData } from '../config'

export const ReferralCodeField = () => {
  const [localInput, setLocalInput] = useState('')

  const { t } = useTranslation()
  const {
    formState: { errors },
    setValue,
    clearErrors,
    getValues,
  } = useFormContext<CreateReferralFormData>()
  const name = getValues('referralName')

  const {
    mutate: checkAvailability,
    error,
    status,
    reset,
  } = useThorNameAvailabilityMutation()

  const inputError =
    localInput && localInput.length > 4 ? t('max_4_characters') : ''

  return (
    <VStack gap={14}>
      <FormField>
        <FormFieldLabel htmlFor="referral-name">
          {t('pick_referral_code')}
        </FormFieldLabel>
        <HStack gap={8}>
          <TextInput
            id="referral-name"
            value={localInput}
            placeholder={t('enter_up_to_4_characters_placeholder')}
            onValueChange={value => {
              setLocalInput(value)
              reset()
              setValue('referralName', '')
            }}
          />
          <Button
            onClick={() => {
              if (localInput) {
                checkAvailability(name, {
                  onSuccess: () => {
                    setValue('referralName', localInput, {
                      shouldValidate: true,
                    })
                    clearErrors('referralName')
                  },
                  onError: () => {
                    setValue('referralName', '')
                  },
                })
              }
            }}
            style={{ maxWidth: 97, fontSize: 14 }}
          >
            {t('search')}
          </Button>
        </HStack>
        {(errors.referralName || inputError) && (
          <FormFieldErrorText>
            {errors?.referralName?.message || inputError}
          </FormFieldErrorText>
        )}
      </FormField>
      <StatusWrapper
        isHidden={status === 'idle'}
        justifyContent="space-between"
        alignItems="center"
      >
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

const StatusWrapper = styled(HStack)<{
  isHidden?: boolean
}>`
  ${({ isHidden }) => (isHidden ? 'display: none' : '')}
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
