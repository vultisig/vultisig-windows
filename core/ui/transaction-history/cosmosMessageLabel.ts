import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { TFunction } from 'i18next'

/** Translation keys in `en.ts` used for Cosmos message tag labels. */
type CosmosMessageLabelKey =
  | 'send'
  | 'delegate'
  | 'undelegate'
  | 'redelegate'
  | 'claim_rewards'
  | 'vote'

/**
 * Maps a Cosmos message typeUrl to a translation key in `en.ts`. Covers the
 * staking/gov/distribution actions a tx may carry so the history tag reads
 * "Delegate"/"Vote"/… instead of a generic "Send". Add an entry (and the
 * matching `en.ts` key) when a new message type needs a dedicated label.
 */
const labelKeyByTypeUrl: Record<string, CosmosMessageLabelKey> = {
  [CosmosMsgType.MSG_SEND_URL]: 'send',
  [CosmosMsgType.MSG_DELEGATE_URL]: 'delegate',
  [CosmosMsgType.MSG_UNDELEGATE_URL]: 'undelegate',
  [CosmosMsgType.MSG_BEGIN_REDELEGATE_URL]: 'redelegate',
  [CosmosMsgType.MSG_WITHDRAW_DELEGATOR_REWARD_URL]: 'claim_rewards',
  '/cosmos.gov.v1.MsgVote': 'vote',
  '/cosmos.gov.v1beta1.MsgVote': 'vote',
  '/cosmos.gov.v1.MsgVoteWeighted': 'vote',
  '/cosmos.gov.v1beta1.MsgVoteWeighted': 'vote',
}

/** Translation key for a known Cosmos message typeUrl, or undefined. */
export const getCosmosMessageLabelKey = (
  typeUrl: string
): CosmosMessageLabelKey | undefined => labelKeyByTypeUrl[typeUrl]

/**
 * Human label for an unmapped typeUrl: the last dotted segment with the `Msg`
 * prefix stripped, e.g. `/cosmos.foo.v1.MsgClaim` → "Claim". Not translated —
 * known types should go through {@link getCosmosMessageLabelKey} instead.
 */
export const deriveCosmosMessageLabel = (typeUrl: string): string => {
  const lastSegment = typeUrl.split('.').pop() ?? typeUrl
  return lastSegment.replace(/^Msg/, '') || typeUrl
}

type GetTransactionTagLabelInput = {
  messageTypeUrl: string | undefined
  t: TFunction
}

/**
 * Resolves the history tag label for a Cosmos send record. Returns undefined
 * when there is no message typeUrl (non-Cosmos sends) so the caller keeps the
 * default "Send" tag.
 */
export const getTransactionTagLabel = ({
  messageTypeUrl,
  t,
}: GetTransactionTagLabelInput): string | undefined => {
  if (!messageTypeUrl) return undefined

  const labelKey = getCosmosMessageLabelKey(messageTypeUrl)
  return labelKey ? t(labelKey) : deriveCosmosMessageLabel(messageTypeUrl)
}
