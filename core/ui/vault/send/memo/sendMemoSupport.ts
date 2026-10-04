import { Chain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { TFunction } from 'i18next'

/**
 * Chains whose transfer transaction has no field to carry a memo. Bittensor's
 * balance transfer extrinsic has no remark, Sui transfers carry no memo, and
 * the NEAR native transfer builder rejects a payload that carries one.
 */
export const chainsWithoutMemoSupport = [
  Chain.Sui,
  Chain.Bittensor,
  Chain.Near,
] as const

type GetSendMemoErrorInput = {
  chain: Chain
  memo: string | undefined
  t: TFunction
}

/**
 * Why the send cannot go ahead with this memo: a deeplink or the agent handed
 * one in for a chain whose transfer cannot carry it, which signing would
 * otherwise drop or fail on.
 */
export const getSendMemoError = ({
  chain,
  memo,
  t,
}: GetSendMemoErrorInput): string | undefined =>
  memo?.trim() && isOneOf(chain, chainsWithoutMemoSupport)
    ? t('send_memo_not_supported', { chain })
    : undefined
