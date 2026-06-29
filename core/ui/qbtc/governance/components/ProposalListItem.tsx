import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import {
  isActiveQbtcProposal,
  QbtcGovProposal,
  QbtcGovVote,
} from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { MyVoteBadge } from './MyVoteBadge'
import { ProposalStatusBadge } from './ProposalStatusBadge'
import { TallyBar } from './TallyBar'
import { VotingCountdown } from './VotingCountdown'

type ProposalListItemProps = {
  proposal: QbtcGovProposal
  vote: QbtcGovVote | null | undefined
  onClick: () => void
}

export const ProposalListItem = ({
  proposal,
  vote,
  onClick,
}: ProposalListItemProps) => {
  const { t } = useTranslation()
  const isActive = isActiveQbtcProposal(proposal.status)

  return (
    <Card onClick={onClick}>
      <HStack justifyContent="space-between" alignItems="center" gap={8}>
        <Text size={12} color="shy">
          {t('qbtc_gov.proposal_number', { id: proposal.id })}
        </Text>
        <ProposalStatusBadge status={proposal.status} />
      </HStack>
      <Text size={15} weight="500">
        {proposal.title || t('qbtc_gov.untitled_proposal')}
      </Text>
      <TallyBar tally={proposal.finalTally} />
      <HStack justifyContent="space-between" alignItems="center" gap={8}>
        {isActive ? (
          <VotingCountdown votingEndTime={proposal.votingEndTime} />
        ) : (
          <span />
        )}
        {vote ? <MyVoteBadge vote={vote} /> : null}
      </HStack>
    </Card>
  )
}

const Card = styled(UnstyledButton)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 16px;
  text-align: left;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  background: ${getColor('foreground')};
  cursor: pointer;
`
