import { create } from '@bufbuild/protobuf'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { omit } from '@lib/utils/record/omit'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { TypedDataEncoder } from 'ethers'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { SignMessageInput } from '../../../interface'

export const Overview = () => {
  const input = usePopupInput<'signMessage'>()
  const { t } = useTranslation()

  const method = getRecordUnionKey(input)
  const { chain } = getRecordUnionValue(input)

  const message = matchRecordUnion<SignMessageInput, string>(input, {
    eth_signTypedData_v4: ({ message: { domain, types, message } }) =>
      TypedDataEncoder.encode(
        domain,
        // Remove EIP712Domain if present — ethers handles it internally
        omit(types, 'EIP712Domain'),
        message
      ),
    sign_message: ({ message }) => message,
    personal_sign: ({ message, bytesCount }) =>
      `\x19Ethereum Signed Message:\n${bytesCount}${message}`,
  })

  const displayMessage = matchRecordUnion<SignMessageInput, string>(input, {
    eth_signTypedData_v4: () => message,
    sign_message: () => message,
    personal_sign: ({ message }) => message,
  })

  const keysignMessagePayload = useMemo(
    () => ({
      custom: create(CustomMessagePayloadSchema, {
        method,
        message,
        chain,
      }),
    }),
    [method, message, chain]
  )

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('sign_message')}
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <List>
          <>
            <ListItem description={method} title={t('method')} />
            <ListItem description={displayMessage} title={t('message')} />
          </>
        </List>
      </PageContent>
      <PageFooter>
        <StartKeysignPrompt keysignPayload={keysignMessagePayload} />
      </PageFooter>
    </VStack>
  )
}
