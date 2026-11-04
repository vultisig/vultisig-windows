import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { textInputHeight } from '@lib/ui/css/textInput'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useThorNameAvailabilityMutation } from '../../../../mutations/useThorNameAvailabilityMutation'
import { useCreateReferralForm } from '../../../../providers/CreateReferralFormProvider'
import {
  FormField,
  FormFieldErrorText,
  FormFieldLabel,
  ReferralTextInput,
} from '../../../Referrals.styled'

export const ReferralCodeField = () => {
  const [localInput, setLocalInput] = useState('')

  const { t } = useTranslation()
  const {
    formState: { errors },
    setValue,
    clearErrors,
    trigger,
  } = useCreateReferralForm()

  const {
    mutate: checkAvailability,
    error,
    status,
    reset,
  } = useThorNameAvailabilityMutation()

  const trimmedInput = localInput.trim()
  const isInputTooLong = trimmedInput.length > 4
  const isInputEmpty = trimmedInput.length === 0
  const hasWhitespace = /\s/.test(trimmedInput)
  const isSearchDisabled =
    isInputEmpty || isInputTooLong || hasWhitespace || status === 'pending'

  const inputError = isInputTooLong ? t('max_4_characters') : ''

  return (
    <VStack gap={14}>
      <FormField>
        <FormFieldLabel htmlFor="referral-name">
          {t('pick_referral_code')}
        </FormFieldLabel>
        <HStack gap={8}>
          <ReferralTextInput
            id="referral-name"
            value={localInput}
            placeholder={t('enter_up_to_4_characters_placeholder')}
            validation={
              status === 'success'
                ? 'valid'
                : status === 'error'
                  ? 'invalid'
                  : undefined
            }
            onValueChange={value => {
              setLocalInput(value)
              reset()
              setValue('referralName', '')
            }}
          />
          <SearchButton
            disabled={isSearchDisabled}
            onClick={() => {
              checkAvailability(trimmedInput, {
                onSuccess: async () => {
                  setValue('referralName', trimmedInput)
                  clearErrors('referralName')
                  await trigger()
                },
                onError: () => {
                  setValue('referralName', '')
                },
              })
            }}
          >
            {t('search')}
          </SearchButton>
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
              <StatusLabel color="shy" variant="stationBodyS">
                {t('referral_status')}
              </StatusLabel>
              <StatusPill>
                <Text color="danger" variant="footnote">
                  {extractErrorMsg(error)}
                </Text>
              </StatusPill>
            </>
          )}
          success={() => (
            <>
              <StatusLabel color="shy" variant="stationBodyS">
                {t('referral_status')}
              </StatusLabel>
              <StatusPill>
                <AvailableText variant="footnote">
                  {t('available')}
                </AvailableText>
              </StatusPill>
            </>
          )}
          idle={() => null}
        />
      </StatusWrapper>
    </VStack>
  )
}

const SearchButton = styled(Button)`
  ${borderRadius.md};
  flex-shrink: 0;
  font-weight: 600;
  height: ${textInputHeight}px;
  padding-inline: 0;
  width: 97px;
`

const StatusWrapper = styled(HStack)<{
  isHidden?: boolean
}>`
  ${({ isHidden }) => (isHidden ? 'display: none' : '')}
  gap: 12px;
  min-height: 52px;
  position: relative;
`

const StatusLabel = styled(SettingsBaselineText)`
  flex-shrink: 0;
`

const AvailableText = styled(Text)`
  color: ${getColor('success')};
`

const StatusPill = styled.div`
  display: flex;
  padding: 6.5px 10.5px;
  align-items: center;
  gap: 4px;
  ${borderRadius.pill};
  border: 1.5px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`
