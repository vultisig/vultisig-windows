import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { HStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
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

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('qbtc_gov.confirm_vote')}
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
          // Only sign once the proposal is resolved — a stale/invalid
          // proposalId must not reach signing behind the title fallback.
          const proposal = proposals.find(p => p.id === proposalId)
          if (!proposal) {
            return (
              <PageContent>
                <Text color="danger">{t('qbtc_gov.proposal_not_found')}</Text>
              </PageContent>
            )
          }
          return (
            <>
              <PageContent gap={16} scrollable>
                <VoteOverview
                  proposalId={proposalId}
                  proposalTitle={proposal.title}
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
                  <Text color="danger">
                    {t('qbtc_gov.enable_qbtc_to_vote')}
                  </Text>
                )}
              </PageFooter>
            </>
          )
        }}
      />
    </>
  )
}
