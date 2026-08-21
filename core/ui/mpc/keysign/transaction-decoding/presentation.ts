import { DecodedOperation } from './decodeSignedTransaction'

type SignedTransactionTitleKey =
  | 'you_are_staking'
  | 'you_are_unstaking'
  | 'you_are_bonding'
  | 'you_are_unbonding'
  | 'you_are_moving'
  | 'you_are_claiming'
  | 'you_are_minting'
  | 'you_are_redeeming'
  | 'signed_tx_you_are_rebonding'
  | 'signed_tx_you_are_merging'
  | 'signed_tx_you_are_unmerging'
  | 'signed_tx_you_are_switching'
  | 'signed_tx_rebonded'
  | 'signed_tx_merged'
  | 'signed_tx_unmerged'
  | 'signed_tx_switched'
  | 'leave'
  | 'add_thor_lp'
  | 'remove_thor_lp'
  | 'vote'
  | 'swap_limit_review_heading'
  | 'swap_limit_cancel_verify_title'
  | 'approve'
  | 'staked'
  | 'unstake'
  | 'bonded'
  | 'unbond'
  | 'left_pool'
  | 'transferred'
  | 'claim_rewards'
  | 'mint'
  | 'redeem'
  | 'withdraw'
  | 'deposited'
  | 'swap_limit_cancel_sent'

const verifyTitle: Record<
  DecodedOperation,
  SignedTransactionTitleKey | undefined
> = {
  transfer: undefined,
  swap: undefined,
  approve: undefined,
  stake: 'you_are_staking',
  unstake: 'you_are_unstaking',
  bond: 'you_are_bonding',
  unbond: 'you_are_unbonding',
  rebond: 'signed_tx_you_are_rebonding',
  leave: 'leave',
  delegate: 'you_are_staking',
  undelegate: 'you_are_unstaking',
  redelegate: 'you_are_moving',
  claimRewards: 'you_are_claiming',
  mint: 'you_are_minting',
  redeem: 'you_are_redeeming',
  withdrawStake: 'you_are_unstaking',
  addLiquidity: 'add_thor_lp',
  removeLiquidity: 'remove_thor_lp',
  merge: 'signed_tx_you_are_merging',
  unmerge: 'signed_tx_you_are_unmerging',
  ibcTransfer: 'you_are_moving',
  vote: undefined,
  securedAssetDeposit: 'you_are_moving',
  securedAssetWithdraw: 'you_are_moving',
  switchChain: 'signed_tx_you_are_switching',
  limitOrderPlacement: 'swap_limit_review_heading',
  limitOrderCancel: 'swap_limit_cancel_verify_title',
  contractCall: undefined,
  unknown: undefined,
}

const doneTitle: Record<
  DecodedOperation,
  SignedTransactionTitleKey | undefined
> = {
  transfer: undefined,
  swap: undefined,
  approve: 'approve',
  stake: 'staked',
  unstake: 'unstake',
  bond: 'bonded',
  unbond: 'unbond',
  rebond: 'signed_tx_rebonded',
  leave: 'left_pool',
  delegate: 'staked',
  undelegate: 'unstake',
  redelegate: 'transferred',
  claimRewards: 'claim_rewards',
  mint: 'mint',
  redeem: 'redeem',
  withdrawStake: 'withdraw',
  addLiquidity: 'add_thor_lp',
  removeLiquidity: 'remove_thor_lp',
  merge: 'signed_tx_merged',
  unmerge: 'signed_tx_unmerged',
  ibcTransfer: 'transferred',
  vote: 'vote',
  securedAssetDeposit: 'deposited',
  securedAssetWithdraw: 'withdraw',
  switchChain: 'signed_tx_switched',
  limitOrderPlacement: 'swap_limit_review_heading',
  limitOrderCancel: 'swap_limit_cancel_sent',
  contractCall: undefined,
  unknown: undefined,
}

export const getVerifyTransactionTitleKey = (
  operation: DecodedOperation
): SignedTransactionTitleKey | undefined => verifyTitle[operation]

export const getDoneTransactionTitleKey = (
  operation: DecodedOperation
): SignedTransactionTitleKey | undefined => doneTitle[operation]
