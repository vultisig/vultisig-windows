import { useQuery } from '@tanstack/react-query'
import { getQbtcGovParams } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/getQbtcGovParams'
import { getQbtcMyVote } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/getQbtcMyVote'
import { getQbtcProposals } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/getQbtcProposals'
import { getQbtcProposalTally } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/getQbtcProposalTally'

/** All QBTC governance proposals (active + past), newest first. */
export const useQbtcProposalsQuery = () =>
  useQuery({
    queryKey: ['qbtcGovernanceProposals'] as const,
    queryFn: getQbtcProposals,
    staleTime: 60_000,
  })

/** Live tally for a single proposal — used on the detail screen. */
export const useQbtcProposalTallyQuery = ({
  proposalId,
  enabled = true,
}: {
  proposalId: string
  enabled?: boolean
}) =>
  useQuery({
    queryKey: ['qbtcGovernanceTally', proposalId] as const,
    queryFn: () => getQbtcProposalTally(proposalId),
    enabled: enabled && proposalId.length > 0,
    staleTime: 30_000,
  })

/** The current vault's recorded vote on a proposal (`null` = not voted). */
export const useQbtcMyVoteQuery = ({
  proposalId,
  voter,
}: {
  proposalId: string
  voter: string
}) =>
  useQuery({
    queryKey: ['qbtcGovernanceMyVote', proposalId, voter] as const,
    queryFn: () => getQbtcMyVote({ proposalId, voter }),
    enabled: proposalId.length > 0 && voter.length > 0,
    staleTime: 30_000,
  })

/**
 * The vault's recorded votes across several proposals at once, keyed by
 * proposal id. Used to show "voted" badges in the list without spawning a hook
 * per row.
 */
export const useQbtcMyVotesQuery = ({
  proposalIds,
  voter,
}: {
  proposalIds: string[]
  voter: string
}) =>
  useQuery({
    queryKey: ['qbtcGovernanceMyVotes', voter, proposalIds] as const,
    queryFn: async () => {
      const votes = await Promise.all(
        proposalIds.map(async proposalId => ({
          proposalId,
          vote: await getQbtcMyVote({ proposalId, voter }),
        }))
      )
      return Object.fromEntries(
        votes.map(({ proposalId, vote }) => [proposalId, vote])
      )
    },
    enabled: voter.length > 0 && proposalIds.length > 0,
    staleTime: 30_000,
  })

/** Governance voting/tallying params (voting period, quorum hint). */
export const useQbtcGovParamsQuery = () =>
  useQuery({
    queryKey: ['qbtcGovernanceParams'] as const,
    queryFn: getQbtcGovParams,
    staleTime: 5 * 60_000,
  })
