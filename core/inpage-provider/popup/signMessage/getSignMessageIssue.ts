import { getCustomMessageBytes } from '@core/ui/mpc/keysign/customMessage/getCustomMessageBytes'
import { getTonSignDataPayloadIssue } from '@core/ui/mpc/keysign/customMessage/ton/tonSignData'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { attempt } from '@vultisig/lib-utils/attempt'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

import {
  rawSignMessageChains,
  RawSignMessageInput,
  SignMessageInput,
} from '../interface'
import { getOriginHostname } from './getOriginHostname'
import { getRippleMessageBytes } from './getRippleMessageBytes'
import { hasRippleSigningPrefix } from './hasRippleSigningPrefix'
import { isSolanaTransactionMessage } from './isSolanaTransactionMessage'

const getRawSignMessageIssue = ({
  chain,
  message,
  isHex,
}: RawSignMessageInput): string | undefined => {
  if (!isOneOf(chain, rawSignMessageChains)) {
    return 'Raw message signing is not supported on this chain'
  }

  if (typeof message !== 'string') {
    return 'The message must be a string'
  }

  if (
    chain === OtherChain.Solana &&
    isSolanaTransactionMessage(getCustomMessageBytes(message))
  ) {
    return 'The message is a Solana transaction. Send it as a transaction so it can be reviewed.'
  }

  if (chain === OtherChain.Ripple) {
    const bytes = attempt(() => getRippleMessageBytes({ message, isHex }))
    if ('error' in bytes) {
      return 'The XRPL message is not valid hex'
    }
    if (hasRippleSigningPrefix(bytes.data)) {
      return 'The message is an XRPL signing payload. Send it as a transaction so it can be reviewed.'
    }
  }
}

const isTonTimestamp = (value: number) =>
  Number.isSafeInteger(value) && value >= 0

const isHostname = (value: string) =>
  typeof value === 'string' && getOriginHostname(`https://${value}`) === value

type GetSignMessageIssueInput = {
  input: SignMessageInput
  requestOrigin: string
}

/**
 * Why a dApp `signMessage` request must be refused before the popup opens,
 * or `undefined` when it may be shown. The input comes straight from the
 * page, which can skip the inpage provider, so these rules run in the
 * background and check every field at runtime.
 */
export const getSignMessageIssue = ({
  input,
  requestOrigin,
}: GetSignMessageIssueInput): string | undefined =>
  matchRecordUnion<SignMessageInput, string | undefined>(input, {
    eth_signTypedData_v4: () => undefined,
    personal_sign: () => undefined,
    cosmos_sign_arbitrary: () => undefined,
    sign_message: getRawSignMessageIssue,
    ton_proof: ({ chain, domain, timestamp, payload }) => {
      if (chain !== OtherChain.Ton) {
        return 'ton_proof is only supported on TON'
      }
      if (!isHostname(domain)) {
        return 'The ton_proof domain must be a hostname'
      }
      if (!isTonTimestamp(timestamp)) {
        return 'The ton_proof timestamp must be a non-negative integer'
      }
      if (typeof payload !== 'string') {
        return 'The ton_proof payload must be a string'
      }
    },
    ton_sign_data: ({ chain, timestamp, payload }) => {
      if (chain !== OtherChain.Ton) {
        return 'signData is only supported on TON'
      }
      if (!getOriginHostname(requestOrigin)) {
        return 'signData needs a page with a hostname'
      }
      if (!isTonTimestamp(timestamp)) {
        return 'The signData timestamp must be a non-negative integer'
      }
      if (typeof payload !== 'object' || payload === null) {
        return 'Invalid signData payload'
      }
      return getTonSignDataPayloadIssue(payload)
    },
  })
