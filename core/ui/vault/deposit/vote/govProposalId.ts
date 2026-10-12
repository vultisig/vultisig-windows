import { parseUint64 } from '@vultisig/core-chain/chains/cosmos/parseUint64'

/**
 * Parses a governance proposal id: a positive integer within the uint64 a
 * `MsgVote` carries. Throws on anything else, including the empty string and
 * zero, which would otherwise become a vote on proposal 0.
 */
export const parseGovProposalId = (value: unknown): bigint => {
  const proposalId = parseUint64({
    value,
    field: 'proposal id',
    context: 'governance vote',
  })
  if (proposalId === 0n) {
    throw new Error('Invalid governance vote proposal id: must be positive')
  }

  return proposalId
}
