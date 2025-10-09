import { create } from '@bufbuild/protobuf'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { Button } from '@lib/ui/buttons/Button'
import { ProgressLine } from '@lib/ui/flow/ProgressLine'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
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
        onBack={step === 'verify' ? toPreviousStep : undefined}
        title={t('sign_message')}
      />
      <PageContent gap={24} flexGrow scrollable>
        <ProgressLine value={0.2} />
        <VStack gap={16}>
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
        </VStack>
      </PageContent>
      <PageFooter>
        {step === 'form' ? (
          <Button onClick={toNextStep}>{t('continue')}</Button>
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
