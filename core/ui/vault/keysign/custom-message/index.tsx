import { create } from '@bufbuild/protobuf'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { Button } from '@lib/ui/buttons/Button'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { StartKeysignPrompt } from '../../../mpc/keysign/prompt/StartKeysignPrompt'
import { StartKeysignPromptProps } from '../../../mpc/keysign/prompt/StartKeysignPromptProps'
import { useCurrentVault } from '../../state/currentVault'
import { getVaultId } from '../../Vault'

const steps = ['form', 'verify'] as const

export const SignCustomMessagePage = () => {
  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps,
  })
  const { t } = useTranslation()

  const [method, setMethod] = useState('')
  const [message, setMessage] = useState('')
  const vault = useCurrentVault()

  const isFillingForm = step === 'form'

  const isDisabled = useMemo(() => {
    if (!method) return t('method_required')
    if (!message) return t('message_required')
  }, [method, message, t])

  const keysignPayload = useMemo(() => {
    return {
      custom: create(CustomMessagePayloadSchema, {
        method,
        message,
        vaultPublicKeyEcdsa: getVaultId(vault),
      }),
    }
  }, [method, message, vault])

  const startKeysignPromptProps: StartKeysignPromptProps = useMemo(() => {
    if (isDisabled) {
      return {
        disabledMessage: isDisabled,
      }
    }

    return {
      keysignPayload,
    }
  }, [keysignPayload, isDisabled])

  return (
    <VStack fullHeight>
      <FlowPageHeader
        onBack={!isFillingForm ? toPreviousStep : undefined}
        title={isFillingForm ? t('sign_message') : t('verify')}
      />
      <PageContent gap={24} flexGrow scrollable>
        <VStack gap={16}>
          {isFillingForm ? (
            <>
              <StyledTextInput
                value={method}
                onValueChange={setMethod}
                placeholder={t('signing_method')}
              />
              <StyledTextInput
                value={message}
                onValueChange={setMessage}
                placeholder={t('message_to_sign')}
              />
            </>
          ) : (
            <>
              <ReviewItem>
                <Text size={12} color="shy" weight={500}>
                  {t('signing_method')}
                </Text>
                <Text size={14} weight={500}>
                  {method}
                </Text>
              </ReviewItem>
              <ReviewItem>
                <Text size={12} color="shy" weight={500}>
                  {t('message_to_sign')}
                </Text>
                <Text size={14} weight={500}>
                  {message}
                </Text>
              </ReviewItem>
            </>
          )}
        </VStack>
      </PageContent>
      <PageFooter>
        {isFillingForm ? (
          <Button disabled={isDisabled} onClick={toNextStep}>
            {t('continue')}
          </Button>
        ) : (
          <StartKeysignPrompt {...startKeysignPromptProps} />
        )}
      </PageFooter>
    </VStack>
  )
}

const StyledTextInput = styled(TextInput)`
  font-weight: 500;
  padding-left: 16px;
  border: 1px solid ${getColor('foregroundExtra')};

  &::placeholder {
    font-weight: 500;
    font-size: 16px;
  }
`

const ReviewItem = styled.div`
  ${vStack({
    gap: 12,
  })};

  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: rgba(11, 26, 58, 0.5);
  min-width: 0;
`
