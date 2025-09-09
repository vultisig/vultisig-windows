import { create } from '@bufbuild/protobuf'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { ChainInput } from '@core/ui/chain/inputs/ChainInput'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import {
  customMessageDefaultChain,
  CustomMessageSupportedChain,
  customMessageSupportedChains,
} from '@core/ui/mpc/keysign/customMessage/chains'
import { ProgressLine } from '@lib/ui/flow/ProgressLine'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StartKeysignPrompt } from '../../../mpc/keysign/prompt/StartKeysignPrompt'
import { StartKeysignPromptProps } from '../../../mpc/keysign/prompt/StartKeysignPromptProps'

export const SignCustomMessagePage = () => {
  const { t } = useTranslation()
  const [chain, setChain] = useState<CustomMessageSupportedChain>(
    customMessageDefaultChain
  )
  const [method, setMethod] = useState('')
  const [message, setMessage] = useState('')

  const isDisabled = useMemo(() => {
    if (!method) return t('method_required')
    if (!message) return t('message_required')
  }, [method, message, t])

  const keysignPayload = useMemo(() => {
    return {
      custom: create(CustomMessagePayloadSchema, {
        chain,
        method,
        message,
      }),
    }
  }, [chain, method, message])

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
      <FlowPageHeader title={t('sign_message')} />
      <PageContent gap={24} flexGrow scrollable>
        <ProgressLine value={0.2} />
        <VStack gap={16}>
          <ChainInput
            value={chain}
            onChange={setChain}
            options={customMessageSupportedChains}
          />
          <TextInput
            label={t('method')}
            value={method}
            onValueChange={setMethod}
            placeholder={t('signing_method')}
          />
          <TextInput
            label={t('message')}
            value={message}
            onValueChange={setMessage}
            placeholder={t('message_to_sign')}
          />
        </VStack>
      </PageContent>
      <PageFooter>
        <StartKeysignPrompt {...startKeysignPromptProps} />
      </PageFooter>
    </VStack>
  )
}
