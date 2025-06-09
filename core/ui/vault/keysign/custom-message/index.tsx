import { create } from '@bufbuild/protobuf'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/StartKeysignPrompt'
import { ProgressLine } from '@lib/ui/flow/ProgressLine'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const SignCustomMessagePage = () => {
  const { t } = useTranslation()
  const [method, setMethod] = useState('')
  const [message, setMessage] = useState('')

  const isDisabled = useMemo(() => {
    if (!method) return t('method_required')
    if (!message) return t('message_required')
  }, [method, message, t])

  const keysignPayload = useMemo(() => {
    return {
      custom: create(CustomMessagePayloadSchema, {
        method,
        message,
      }),
    }
  }, [method, message])

  return (
    <VStack fullHeight>
      <PageHeader
        title={<PageHeaderTitle>{t('sign_message')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <ProgressLine value={0.2} />
        <VStack gap={16}>
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
        <StartKeysignPrompt
          keysignPayload={keysignPayload}
          isDisabled={isDisabled}
        />
      </PageFooter>
    </VStack>
  )
}
