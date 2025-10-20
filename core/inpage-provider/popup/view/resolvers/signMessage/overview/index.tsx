import { create } from '@bufbuild/protobuf'
import {
  SignMessageInput,
  SignMessageType,
} from '@core/inpage-provider/popup/interface'
import { ConnectOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Connect'
import { DefaultOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Default'
import { PolicyOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Policy'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { getVaultId } from '@core/ui/vault/Vault'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { omit } from '@lib/utils/record/omit'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { getBytes, hexlify, TypedDataEncoder } from 'ethers'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { toDisplayMessageString } from '../../../utils/toDisplayMessage'

export const Overview = () => {
  const { t } = useTranslation()
  const { goHome } = useCore()
  const input = usePopupInput<'signMessage'>()
  const method = getRecordUnionKey(input)
  const { chain } = getRecordUnionValue(input)
  const [{ signature }] = useViewState<{ signature?: string }>()
  const address = shouldBePresent(useCurrentVaultAddress(chain))
  const vault = useCurrentVault()
  const message = matchRecordUnion<SignMessageInput, string>(input, {
    eth_signTypedData_v4: ({ message: { domain, types, message } }) =>
      TypedDataEncoder.encode(
        domain,
        // Remove EIP712Domain if present — ethers handles it internally
        omit(types, 'EIP712Domain'),
        message
      ),
    sign_message: ({ message }) => message,
    personal_sign: ({ message, bytesCount }) => {
      const isHex = message.startsWith('0x') || message.startsWith('0X')
      const prefix = `\x19Ethereum Signed Message:\n${bytesCount}`

      if (isHex) {
        const prefixBytes = new TextEncoder().encode(prefix)
        const msgBytes = getBytes(message)
        const combined = new Uint8Array(prefixBytes.length + msgBytes.length)
        combined.set(prefixBytes)
        combined.set(msgBytes, prefixBytes.length)
        return hexlify(combined)
      }

      return `${prefix}${message}`
    },
  })

  const displayMessage = matchRecordUnion<SignMessageInput, string>(input, {
    eth_signTypedData_v4: () => message,
    sign_message: () => message,
    personal_sign: ({ message }) => {
      const bytes =
        message.startsWith('0x') || message.startsWith('0X')
          ? getBytes(message)
          : new TextEncoder().encode(message)
      return toDisplayMessageString(bytes)
    },
  })

  const type = matchRecordUnion<SignMessageInput, SignMessageType>(input, {
    eth_signTypedData_v4: () => 'default',
    sign_message: () => 'default',
    personal_sign: ({ type }) => type,
  })

  const keysignMessagePayload = useMemo(
    () => ({
      custom: create(CustomMessagePayloadSchema, {
        method,
        message,
        chain,
        vaultPublicKeyEcdsa: getVaultId(vault),
      }),
    }),
    [method, message, chain, vault]
  )

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t(signature ? 'overview' : 'sign_message')}
        hasBorder
      />
      <PageContent gap={16} scrollable>
        <Match
          value={type}
          connect={() => (
            <ConnectOverview
              address={address}
              message={displayMessage}
              method={method}
              signature={signature}
            />
          )}
          default={() => (
            <DefaultOverview
              address={address}
              message={displayMessage}
              method={method}
              signature={signature}
            />
          )}
          policy={() => (
            <PolicyOverview
              address={address}
              message={displayMessage}
              method={method}
              signature={signature}
            />
          )}
        />
      </PageContent>
      <PageFooter>
        {signature ? (
          <Button onClick={goHome}>{t('complete')}</Button>
        ) : (
          <StartKeysignPrompt keysignPayload={keysignMessagePayload} />
        )}
      </PageFooter>
    </>
  )
}
