import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { getDeveloperOptions } from '@core/extension/storage/developerOptions'
import {
  SignMessageInput,
  SignMessageType,
} from '@core/inpage-provider/popup/interface'
import { ConnectOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Connect'
import { DefaultOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Default'
import { PolicyOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Policy'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { hexStr2byteArray } from '@core/inpage-provider/popup/view/utils/hexStr2byteArray'
import { toDisplayMessageString } from '@core/inpage-provider/popup/view/utils/toDisplayMessage'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { getVaultId } from '@core/mpc/vault/Vault'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Match } from '@lib/ui/base/Match'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useQuery } from '@tanstack/react-query'
import { getBytes, hexlify, toUtf8Bytes } from 'ethers'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { PopupDeadEnd } from '../../../flow/PopupDeadEnd'

export const Overview = () => {
  const { t } = useTranslation()
  const input = usePopupInput<'signMessage'>()
  const method = getRecordUnionKey(input)
  const { chain } = getRecordUnionValue(input)
  const [{ signature }] = useViewState<{ signature?: string }>()
  const address = shouldBePresent(useCurrentVaultAddress(chain))
  const vault = useCurrentVault()
  const message = matchRecordUnion<SignMessageInput, string>(input, {
    eth_signTypedData_v4: ({ message }) => JSON.stringify(message),
    sign_message: ({ message, chain, useTronHeader }) => {
      const tronMessageHeader = '\x19TRON Signed Message:\n32'
      const ethMessageHeader = '\x19Ethereum Signed Message:\n32'
      if (chain === Chain.Tron) {
        const messageBytes = [
          ...toUtf8Bytes(useTronHeader ? tronMessageHeader : ethMessageHeader),
          ...hexStr2byteArray(message),
        ]
        return hexlify(new Uint8Array(messageBytes))
      }
      return message
    },
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
    eth_signTypedData_v4: ({ message }) => {
      return typeof message === 'string'
        ? message
        : JSON.stringify(message, null, 2)
    },
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

  const pluginId = matchRecordUnion<SignMessageInput, string | undefined>(
    input,
    {
      eth_signTypedData_v4: () => undefined,
      sign_message: () => undefined,
      personal_sign: ({ pluginId }) => pluginId,
    }
  )

  const developerOptionsQuery = useQuery({
    queryKey: [StorageKey.developerOptions],
    queryFn: getDeveloperOptions,
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
    <Match
      value={type}
      connect={() => (
        <ConnectOverview
          address={address}
          keysignPayload={keysignMessagePayload}
          message={displayMessage}
          method={method}
          signature={signature}
        />
      )}
      default={() => (
        <DefaultOverview
          address={address}
          keysignPayload={keysignMessagePayload}
          message={displayMessage}
          method={method}
          signature={signature}
        />
      )}
      policy={() => (
        <MatchQuery
          value={developerOptionsQuery}
          success={({ pluginMarketplaceBaseUrl }) => (
            <PolicyOverview
              address={address}
              keysignPayload={keysignMessagePayload}
              message={displayMessage}
              method={method}
              signature={signature}
              pluginId={shouldBeDefined(pluginId)}
              pluginMarketplaceBaseUrl={pluginMarketplaceBaseUrl}
            />
          )}
          pending={() => (
            <PopupDeadEnd>
              <Spinner />
            </PopupDeadEnd>
          )}
          error={() => (
            <Center>
              <StrictText>{t('failed_to_load')}</StrictText>
            </Center>
          )}
        />
      )}
    />
  )
}
