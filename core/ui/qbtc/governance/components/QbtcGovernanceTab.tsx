import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import {
  isActiveQbtcProposal,
  QbtcGovProposal,
} from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { useTranslation } from 'react-i18next'

import { useQbtcVoterAddress } from '../hooks/useQbtcVoterAddress'
import {
  useQbtcMyVotesQuery,
  useQbtcProposalsQuery,
} from '../queries/useQbtcGovernanceQueries'
import { ProposalListItem } from './ProposalListItem'

export const QbtcGovernanceTab = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const voterAddress = useQbtcVoterAddress()
  const proposalsQuery = useQbtcProposalsQuery()

  return (
    <MatchQuery
      value={proposalsQuery}
      pending={() => (
        <HStack justifyContent="center">
          <Spinner />
        </HStack>
      )}
      error={() => (
        <HStack justifyContent="center">
          <Text color="danger">{t('failed_to_load')}</Text>
        </HStack>
      )}
      success={proposals => (
        <ProposalsList
          proposals={proposals}
          voterAddress={voterAddress}
          onOpen={proposalId =>
            navigate({ id: 'qbtcGovernanceProposal', state: { proposalId } })
          }
        />
      )}
    />
  )
}

type ProposalsListProps = {
  proposals: QbtcGovProposal[]
  voterAddress: string | undefined
  onOpen: (proposalId: string) => void
}

const ProposalsList = ({
  proposals,
  voterAddress,
  onOpen,
}: ProposalsListProps) => {
  const { t } = useTranslation()

  const active = proposals.filter(p => isActiveQbtcProposal(p.status))
  const past = proposals.filter(p => !isActiveQbtcProposal(p.status))

  const myVotesQuery = useQbtcMyVotesQuery({
    proposalIds: proposals.map(p => p.id),
    voter: voterAddress ?? '',
  })

  if (proposals.length === 0) {
    return (
      <HStack justifyContent="center">
        <Text color="shy">{t('qbtc_gov.no_proposals')}</Text>
      </HStack>
    )
  }

  const renderItems = (items: QbtcGovProposal[]) =>
    items.map(proposal => (
      <ProposalListItem
        key={proposal.id}
        proposal={proposal}
        vote={myVotesQuery.data?.[proposal.id]}
        onClick={() => onOpen(proposal.id)}
      />
    ))

  return (
    <VStack gap={20} style={{ marginBottom: 100 }}>
      {active.length > 0 && (
        <VStack gap={12}>
          <Text size={14} weight="500" color="shy">
            {t('qbtc_gov.active_section')}
          </Text>
          {renderItems(active)}
        </VStack>
      )}
      {past.length > 0 && (
        <VStack gap={12}>
          <Text size={14} weight="500" color="shy">
            {t('qbtc_gov.past_section')}
          </Text>
          {renderItems(past)}
        </VStack>
      )}
    </VStack>
  )
}
