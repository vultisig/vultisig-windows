import { create } from '@bufbuild/protobuf'
import { getDeveloperOptions } from '@core/extension/storage/developerOptions'
import {
  Eip712V4Payload,
  SignMessageInput,
  SignMessageType,
} from '@core/inpage-provider/popup/interface'
import { getOriginHostname } from '@core/inpage-provider/popup/signMessage/getOriginHostname'
import { getRawSignMessagePayload } from '@core/inpage-provider/popup/signMessage/getRawSignMessagePayload'
import { getRippleMessageBytes } from '@core/inpage-provider/popup/signMessage/getRippleMessageBytes'
import { ConnectOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Connect'
import { DefaultOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Default'
import {
  getPersonalSignMessage,
  getPersonalSignMessageBytes,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/getPersonalSignMessage'
import { getTonSignDataDisplayMessage } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/getTonSignDataDisplayMessage'
import { PolicyOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Policy'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { toDisplayMessageString } from '@core/inpage-provider/popup/view/utils/toDisplayMessage'
import { serializeAdr36SignDoc } from '@core/ui/mpc/keysign/customMessage/adr36'
import { getCustomMessageBytes } from '@core/ui/mpc/keysign/customMessage/getCustomMessageBytes'
import {
  buildTonProofPayload,
  getTonProofHash,
} from '@core/ui/mpc/keysign/customMessage/ton/tonProof'
import { getTonSignDataHash } from '@core/ui/mpc/keysign/customMessage/ton/tonSignData'
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
import { hexlify } from 'ethers'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { PopupDeadEnd } from '../../../flow/PopupDeadEnd'
import { usePopupContext } from '../../../state/context'
import { isTrustedProductOrigin } from '../utils'

/**
 * The sign-message popup's first screen. It turns the dApp request into the
 * keysign payload, applying each chain's domain separation, and shows the
 * user a readable form of what is signed.
 */
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
    sign_message: getRawSignMessagePayload,
    personal_sign: ({ message }) => getPersonalSignMessage(message),
    // The signed digest is sha256 of the canonical ADR-36 StdSignDoc; carry
    // those bytes (hex) through to `getCustomMessageHex`, which hashes them.
    cosmos_sign_arbitrary: ({ data }) =>
      hexlify(serializeAdr36SignDoc({ signer: address, dataBase64: data })),
    // TON hashes are built here from the readable request, never taken from
    // the page: a raw TON signature over a page-chosen hash could sign a
    // transfer.
    ton_proof: ({ domain, timestamp, payload }) =>
      `0x${getTonProofHash(
        buildTonProofPayload({ address, domain, timestamp, payload })
      )}`,
    ton_sign_data: ({ timestamp, payload }) =>
      `0x${getTonSignDataHash({
        address,
        domain: shouldBePresent(getOriginHostname(requestOrigin)),
        timestamp,
        payload,
      })}`,
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
      if (chain === Chain.Tron) {
        return isV2 ? rawMessage : message
      }
      return toDisplayMessageString(getCustomMessageBytes(rawMessage))
    },
    personal_sign: ({ message }) =>
      toDisplayMessageString(getPersonalSignMessageBytes(message)),
    cosmos_sign_arbitrary: ({ data }) =>
      toDisplayMessageString(fromBase64(data)),
    ton_proof: ({ domain, timestamp, payload }) =>
      JSON.stringify({ domain, timestamp, payload }),
    ton_sign_data: ({ payload }) => getTonSignDataDisplayMessage(payload),
  })

  const requestedType = matchRecordUnion<SignMessageInput, SignMessageType>(
    input,
    {
      eth_signTypedData_v4: () => 'default',
      sign_message: () => 'default',
      personal_sign: ({ type }) => type,
      cosmos_sign_arbitrary: () => 'default',
      ton_proof: () => 'default',
      ton_sign_data: () => 'default',
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
    ton_proof: () => undefined,
    ton_sign_data: () => undefined,
  })

  const tonProofDomain = matchRecordUnion<SignMessageInput, string | undefined>(
    input,
    {
      eth_signTypedData_v4: () => undefined,
      sign_message: () => undefined,
      personal_sign: () => undefined,
      cosmos_sign_arbitrary: () => undefined,
      ton_proof: ({ domain }) => domain,
      ton_sign_data: () => undefined,
    }
  )

  const pluginId = matchRecordUnion<SignMessageInput, string | undefined>(
    input,
    {
      eth_signTypedData_v4: () => undefined,
      sign_message: () => undefined,
      personal_sign: ({ pluginId }) => pluginId,
      cosmos_sign_arbitrary: () => undefined,
      ton_proof: () => undefined,
      ton_sign_data: () => undefined,
    }
  )

  // TON requests keep the `sign_message` method co-signers already handle:
  // the payload carries only the hash the popup built.
  const keysignMethod = matchRecordUnion<SignMessageInput, string>(input, {
    eth_signTypedData_v4: () => method,
    sign_message: () => method,
    personal_sign: () => method,
    cosmos_sign_arbitrary: () => method,
    ton_proof: () => 'sign_message',
    ton_sign_data: () => 'sign_message',
  })

  const developerOptionsQuery = useQuery({
    queryKey: [StorageKey.developerOptions],
    queryFn: getDeveloperOptions,
  })

  const keysignChain = getChainKind(chain) === 'evm' ? Chain.Ethereum : chain

  const keysignMessagePayload = useMemo(
    () => ({
      custom: create(CustomMessagePayloadSchema, {
        method: keysignMethod,
        message,
        chain: keysignChain,
        vaultPublicKeyEcdsa: getVaultId(vault),
      }),
    }),
    [keysignMethod, message, keysignChain, vault]
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
          tonProofDomain={tonProofDomain}
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
