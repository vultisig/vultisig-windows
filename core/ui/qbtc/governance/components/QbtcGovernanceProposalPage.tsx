import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import {
  isActiveQbtcProposal,
  QbtcGovProposal,
  qbtcGovTallyTotal,
  QbtcVoteSelection,
} from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import {
  QbtcVoteOptionKey,
  qbtcVoteOptionKeys,
} from '@vultisig/core-chain/chains/cosmos/qbtc/governance/voteOption'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useQbtcVoterAddress } from '../hooks/useQbtcVoterAddress'
import {
  GovColorToken,
  qbtcVoteOptionColor,
  qbtcVoteOptionLabelKey,
} from '../presentation'
import {
  useQbtcGovParamsQuery,
  useQbtcMyVoteQuery,
  useQbtcProposalsQuery,
  useQbtcProposalTallyQuery,
} from '../queries/useQbtcGovernanceQueries'
import { MessagesSection } from './MessagesSection'
import { MyVoteBadge } from './MyVoteBadge'
import { ProposalStatusBadge } from './ProposalStatusBadge'
import { TallyBreakdown } from './TallyBreakdown'
import { VotingWindowSection } from './VotingWindowSection'
import { WeightedVoteSheet } from './WeightedVoteSheet'

export const QbtcGovernanceProposalPage = () => {
  const { t } = useTranslation()
  const [{ proposalId }] = useCoreViewState<'qbtcGovernanceProposal'>()
  const proposalsQuery = useQbtcProposalsQuery()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('qbtc_gov.proposal_number', { id: proposalId })}
        hasBorder
      />
      <MatchQuery
        value={proposalsQuery}
        pending={() => (
          <PageContent>
            <HStack justifyContent="center">
              <Spinner />
            </HStack>
          </PageContent>
        )}
        error={() => (
          <PageContent>
            <Text color="danger">{t('failed_to_load')}</Text>
          </PageContent>
        )}
        success={proposals => {
          const proposal = proposals.find(p => p.id === proposalId)
          if (!proposal) {
            return (
              <PageContent>
                <Text color="danger">{t('qbtc_gov.proposal_not_found')}</Text>
              </PageContent>
            )
          }
          return <ProposalDetail proposal={proposal} />
        }}
      />
    </>
  )
}

const ProposalDetail = ({ proposal }: { proposal: QbtcGovProposal }) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const voterAddress = useQbtcVoterAddress()
  const isActive = isActiveQbtcProposal(proposal.status)
  const [showWeighted, setShowWeighted] = useState(false)

  const tallyQuery = useQbtcProposalTallyQuery({
    proposalId: proposal.id,
    enabled: isActive,
  })
  const myVoteQuery = useQbtcMyVoteQuery({
    proposalId: proposal.id,
    voter: voterAddress ?? '',
  })
  const paramsQuery = useQbtcGovParamsQuery()

  const tally = isActive
    ? (tallyQuery.data ?? proposal.finalTally)
    : proposal.finalTally
  const myVote = myVoteQuery.data
  const quorum = paramsQuery.data?.quorum

  const castVote = (selection: QbtcVoteSelection) =>
    navigate({
      id: 'qbtcGovernanceVote',
      state: { proposalId: proposal.id, vote: selection },
    })

  return (
    <PageContent gap={20} scrollable>
      <VStack gap={8}>
        <HStack justifyContent="space-between" alignItems="center" gap={8}>
          <ProposalStatusBadge status={proposal.status} />
          {myVote ? <MyVoteBadge vote={myVote} /> : null}
        </HStack>
        <Text size={18} weight="600">
          {proposal.title || t('qbtc_gov.untitled_proposal')}
        </Text>
      </VStack>

      {proposal.summary ? (
        <VStack gap={8}>
          <Text size={13} weight="500" color="shy">
            {t('qbtc_gov.summary')}
          </Text>
          <Text size={14}>{proposal.summary}</Text>
        </VStack>
      ) : null}

      <Card>
        <Text size={14} weight="500">
          {t('qbtc_gov.tally')}
        </Text>
        <TallyBreakdown tally={tally} />
        {qbtcGovTallyTotal(tally) === 0n ? (
          <Text size={12} color="shy">
            {t('qbtc_gov.no_votes_yet')}
          </Text>
        ) : null}
        {quorum !== undefined ? (
          <>
            <Divider />
            <HStack justifyContent="space-between" alignItems="center">
              <Text size={13} color="shy">
                {t('qbtc_gov.quorum')}
              </Text>
              <Text size={13}>{`${(quorum * 100).toFixed(1)}%`}</Text>
            </HStack>
          </>
        ) : null}
      </Card>

      <VotingWindowSection
        votingStartTime={proposal.votingStartTime}
        votingEndTime={proposal.votingEndTime}
        isActive={isActive}
      />

      <MessagesSection messageTypes={proposal.messageTypes} />

      {isActive ? (
        <VStack gap={12}>
          {voterAddress ? (
            <>
              <Text size={14} weight="500">
                {myVote ? t('qbtc_gov.change_vote') : t('qbtc_gov.cast_vote')}
              </Text>
              <VStack gap={8}>
                {qbtcVoteOptionKeys.map(option => (
                  <VoteOptionButton
                    key={option}
                    option={option}
                    onClick={() => castVote({ kind: 'single', option })}
                  />
                ))}
                <Button kind="secondary" onClick={() => setShowWeighted(true)}>
                  {t('qbtc_gov.weighted_vote_cta')}
                </Button>
              </VStack>
            </>
          ) : (
            <Text size={13} color="shy">
              {t('qbtc_gov.enable_qbtc_to_vote')}
            </Text>
          )}
        </VStack>
      ) : null}

      {showWeighted ? (
        <WeightedVoteSheet
          onClose={() => setShowWeighted(false)}
          onSubmit={selection => {
            setShowWeighted(false)
            castVote(selection)
          }}
        />
      ) : null}
    </PageContent>
  )
}

const VoteOptionButton = ({
  option,
  onClick,
}: {
  option: QbtcVoteOptionKey
  onClick: () => void
}) => {
  const { t } = useTranslation()
  return (
    <OptionButton onClick={onClick}>
      <Dot $token={qbtcVoteOptionColor[option]} />
      <Text size={14} weight="500">
        {t(qbtcVoteOptionLabelKey[option])}
      </Text>
    </OptionButton>
  )
}

const Card = styled(VStack).attrs({ gap: 12 })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  background: ${getColor('foreground')};
`

const Divider = styled.hr`
  width: 100%;
  border: none;
  border-top: 1px solid ${getColor('foregroundExtra')};
  margin: 0;
`

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  cursor: pointer;
`

const Dot = styled.span<{ $token: GovColorToken }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ $token }) => getColor($token)};
`
