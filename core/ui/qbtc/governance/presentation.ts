import { QbtcProposalStatus } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { QbtcVoteOptionKey } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/voteOption'

/** Theme color tokens (keys of `theme.colors`) used across the governance UI. */
export type GovColorToken = 'success' | 'danger' | 'idle' | 'info' | 'textShy'

export const qbtcProposalStatusColor: Record<
  QbtcProposalStatus,
  GovColorToken
> = {
  passed: 'success',
  votingPeriod: 'info',
  rejected: 'danger',
  failed: 'danger',
  depositPeriod: 'idle',
  unspecified: 'textShy',
}

/** i18n key (under `qbtc_gov.status.*`) for a proposal status label. */
export const qbtcProposalStatusLabelKey = {
  passed: 'qbtc_gov.status.passed',
  votingPeriod: 'qbtc_gov.status.voting',
  rejected: 'qbtc_gov.status.rejected',
  failed: 'qbtc_gov.status.failed',
  depositPeriod: 'qbtc_gov.status.deposit',
  unspecified: 'qbtc_gov.status.unspecified',
} as const satisfies Record<QbtcProposalStatus, string>

export const qbtcVoteOptionColor: Record<QbtcVoteOptionKey, GovColorToken> = {
  yes: 'success',
  abstain: 'textShy',
  no: 'idle',
  noWithVeto: 'danger',
}

/** i18n key (under `qbtc_gov.option.*`) for a vote option label. */
export const qbtcVoteOptionLabelKey = {
  yes: 'qbtc_gov.option.yes',
  abstain: 'qbtc_gov.option.abstain',
  no: 'qbtc_gov.option.no',
  noWithVeto: 'qbtc_gov.option.noWithVeto',
} as const satisfies Record<QbtcVoteOptionKey, string>

type QbtcVotingRemaining =
  | { ended: true }
  | { ended: false; days: number; hours: number; minutes: number }

/**
 * Breaks the time left until `votingEndTime` into days/hours/minutes for the
 * countdown label, or `{ ended: true }` once the window has closed. Returns
 * `undefined` when no end time is known.
 */
export const getQbtcVotingRemaining = ({
  votingEndTime,
  nowMs,
}: {
  votingEndTime: string | undefined
  nowMs: number
}): QbtcVotingRemaining | undefined => {
  if (!votingEndTime) return undefined
  const endMs = new Date(votingEndTime).getTime()
  if (!Number.isFinite(endMs)) return undefined
  const remainingMs = endMs - nowMs
  if (remainingMs <= 0) return { ended: true }
  const totalMinutes = Math.floor(remainingMs / 60_000)
  return {
    ended: false,
    days: Math.floor(totalMinutes / (60 * 24)),
    hours: Math.floor((totalMinutes % (60 * 24)) / 60),
    minutes: totalMinutes % 60,
  }
}
