import { create } from '@bufbuild/protobuf'
import { getDeveloperOptions } from '@core/extension/storage/developerOptions'
import {
  Eip712V4Payload,
  SignMessageInput,
  SignMessageType,
} from '@core/inpage-provider/popup/interface'
import { ConnectOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Connect'
import { DefaultOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Default'
import { PolicyOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Policy'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { hexStr2byteArray } from '@core/inpage-provider/popup/view/utils/hexStr2byteArray'
import { toDisplayMessageString } from '@core/inpage-provider/popup/view/utils/toDisplayMessage'
import { serializeAdr36SignDoc } from '@core/ui/mpc/keysign/customMessage/adr36'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { fromBase64 } from '@cosmjs/encoding'
import { Match } from '@lib/ui/base/Match'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { Chain, EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { CustomMessagePayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBeDefined } from '@vultisig/lib-utils/assert/shouldBeDefined'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { getRecordUnionKey } from '@vultisig/lib-utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { getBytes, hexlify, toUtf8Bytes } from 'ethers'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { PopupDeadEnd } from '../../../flow/PopupDeadEnd'
import { usePopupContext } from '../../../state/context'
import { isTrustedProductOrigin } from '../utils'

/**
 * Raw message bytes for an XRPL `signMessage`, mirroring GemWallet: a hex
 * string is decoded verbatim, otherwise the text is UTF-8 encoded.
 */
const getRippleMessageBytes = ({
  message,
  isHex,
}: {
  message: string
  isHex?: boolean
}): Uint8Array =>
  isHex
    ? getBytes(
        message.startsWith('0x') || message.startsWith('0X')
          ? message
          : `0x${message}`
      )
    : toUtf8Bytes(message)

export const Overview = () => {
  const { t } = useTranslation()
  const input = usePopupInput<'signMessage'>()
  const { requestOrigin } = usePopupContext<'signMessage'>()
  const method = getRecordUnionKey(input)
  const { chain } = getRecordUnionValue(input)
  const [{ signature }] = useViewState<{ signature?: string }>()
  const address = shouldBePresent(useCurrentVaultAddress(chain))
  const vault = useCurrentVault()
  const message = matchRecordUnion<SignMessageInput, string>(input, {
    eth_signTypedData_v4: ({ message }) => JSON.stringify(message),
    sign_message: ({ message, chain, useTronHeader, isV2, isHex }) => {
      if (chain === Chain.Tron) {
        if (isV2) {
          const msgBytes = toUtf8Bytes(message)
          const tip191Header = `\x19TRON Signed Message:\n${msgBytes.length}`
          const allBytes = [...toUtf8Bytes(tip191Header), ...msgBytes]
          return hexlify(new Uint8Array(allBytes))
        }
        const tronMessageHeader = '\x19TRON Signed Message:\n32'
        const ethMessageHeader = '\x19Ethereum Signed Message:\n32'
        const messageBytes = [
          ...toUtf8Bytes(useTronHeader ? tronMessageHeader : ethMessageHeader),
          ...hexStr2byteArray(message),
        ]
        return hexlify(new Uint8Array(messageBytes))
      }
      // XRPL signs SHA-512-half of the raw message bytes (done in
      // `getCustomMessageHex`); carry those exact bytes through as hex.
      if (chain === OtherChain.Ripple) {
        return hexlify(getRippleMessageBytes({ message, isHex }))
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
    // The signed digest is sha256 of the canonical ADR-36 StdSignDoc; carry
    // those bytes (hex) through to `getCustomMessageHex`, which hashes them.
    cosmos_sign_arbitrary: ({ data }) =>
      hexlify(serializeAdr36SignDoc({ signer: address, dataBase64: data })),
  })

  const displayMessage = matchRecordUnion<SignMessageInput, string>(input, {
    eth_signTypedData_v4: ({ message }) => {
      return typeof message === 'string'
        ? message
        : JSON.stringify(message, null, 2)
    },
    sign_message: ({ message: rawMessage, isV2, chain, isHex }) => {
      if (chain === OtherChain.Ripple) {
        return toDisplayMessageString(
          getRippleMessageBytes({ message: rawMessage, isHex })
        )
      }
      if (isV2) return rawMessage
      return message
    },
    personal_sign: ({ message }) => {
      const bytes =
        message.startsWith('0x') || message.startsWith('0X')
          ? getBytes(message)
          : new TextEncoder().encode(message)
      return toDisplayMessageString(bytes)
    },
    cosmos_sign_arbitrary: ({ data }) =>
      toDisplayMessageString(fromBase64(data)),
  })

  const requestedType = matchRecordUnion<SignMessageInput, SignMessageType>(
    input,
    {
      eth_signTypedData_v4: () => 'default',
      sign_message: () => 'default',
      personal_sign: ({ type }) => type,
      cosmos_sign_arbitrary: () => 'default',
    }
  )

  // The low-disclosure `connect`/`policy` screens are reserved for the
  // first-party marketplace origin. Any other origin is forced onto the
  // `default` overview, which always renders the message being signed, so a
  // hostile dApp cannot use the branded screens to obscure what is signed.
  const type = isTrustedProductOrigin(requestOrigin) ? requestedType : 'default'

  const typedData = matchRecordUnion<
    SignMessageInput,
    { chain: EvmChain; payload: Eip712V4Payload } | undefined
  >(input, {
    eth_signTypedData_v4: ({ chain, message }) => ({ chain, payload: message }),
    sign_message: () => undefined,
    personal_sign: () => undefined,
    cosmos_sign_arbitrary: () => undefined,
  })

  const pluginId = matchRecordUnion<SignMessageInput, string | undefined>(
    input,
    {
      eth_signTypedData_v4: () => undefined,
      sign_message: () => undefined,
      personal_sign: ({ pluginId }) => pluginId,
      cosmos_sign_arbitrary: () => undefined,
    }
  )

  const developerOptionsQuery = useQuery({
    queryKey: [StorageKey.developerOptions],
    queryFn: getDeveloperOptions,
  })

  const keysignChain = getChainKind(chain) === 'evm' ? Chain.Ethereum : chain

  const keysignMessagePayload = useMemo(
    () => ({
      custom: create(CustomMessagePayloadSchema, {
        method,
        message,
        chain: keysignChain,
        vaultPublicKeyEcdsa: getVaultId(vault),
      }),
    }),
    [method, message, keysignChain, vault]
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
          typedData={typedData}
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
