import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useQbtcVoterAddress } from '../hooks/useQbtcVoterAddress'
import { useQbtcProposalsQuery } from '../queries/useQbtcGovernanceQueries'
import { GovernanceVoteConfirmButton } from './GovernanceVoteConfirmButton'
import { VoteOverview } from './VoteOverview'

/** Verify + sign screen for a QBTC governance vote (single or weighted). */
export const QbtcGovernanceVotePage = () => {
  const { t } = useTranslation()
  const [{ proposalId, vote }] = useCoreViewState<'qbtcGovernanceVote'>()
  const voterAddress = useQbtcVoterAddress()
  const proposalsQuery = useQbtcProposalsQuery()
  const proposalTitle = proposalsQuery.data?.find(
    p => p.id === proposalId
  )?.title

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('qbtc_gov.confirm_vote')}
        hasBorder
      />
      <PageContent gap={16} scrollable>
        <VoteOverview
          proposalId={proposalId}
          proposalTitle={proposalTitle}
          selection={vote}
        />
      </PageContent>
      <PageFooter>
        {voterAddress ? (
          <GovernanceVoteConfirmButton
            voterAddress={voterAddress}
            proposalId={proposalId}
            selection={vote}
          />
        ) : (
          <Text color="danger">{t('qbtc_gov.enable_qbtc_to_vote')}</Text>
        )}
      </PageFooter>
    </>
  )
}
