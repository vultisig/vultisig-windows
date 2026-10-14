import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov'

/** Ballots the deposit Vote action offers, in canonical Cosmos `x/gov` order. */
export const govVoteOptions = ['yes', 'abstain', 'no', 'noWithVeto'] as const

/** One ballot of a Cosmos governance vote. */
export type GovVoteOption = (typeof govVoteOptions)[number]

/** The `x/gov` proto value each ballot is signed as. */
export const govVoteOptionProtoValue: Record<GovVoteOption, VoteOption> = {
  yes: VoteOption.VOTE_OPTION_YES,
  abstain: VoteOption.VOTE_OPTION_ABSTAIN,
  no: VoteOption.VOTE_OPTION_NO,
  noWithVeto: VoteOption.VOTE_OPTION_NO_WITH_VETO,
}
