import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { QbtcVoteSelection } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { useTranslation } from 'react-i18next'

import { qbtcVoteOptionLabelKey } from '../presentation'

type VoteOverviewProps = {
  proposalId: string
  proposalTitle: string | undefined
  selection: QbtcVoteSelection
}

/** iOS-style confirmation summary shown before signing a QBTC gov vote. */
export const VoteOverview = ({
  proposalId,
  proposalTitle,
  selection,
}: VoteOverviewProps) => {
  const { t } = useTranslation()

  return (
    <List border="gradient" radius={16}>
      <ListItem
        title={t('qbtc_gov.proposal_number', { id: proposalId })}
        description={proposalTitle || t('qbtc_gov.untitled_proposal')}
      />
      {selection.kind === 'single' ? (
        <ListItem
          title={t('qbtc_gov.your_vote')}
          extra={
            <Text weight="500">
              {t(qbtcVoteOptionLabelKey[selection.option])}
            </Text>
          }
        />
      ) : (
        <ListItem
          title={t('qbtc_gov.your_vote')}
          description={
            <VStack gap={4}>
              {selection.options
                .filter(({ weightPercent }) => weightPercent > 0)
                .map(({ option, weightPercent }) => (
                  <HStack key={option} justifyContent="space-between" gap={16}>
                    <Text size={13}>{t(qbtcVoteOptionLabelKey[option])}</Text>
                    <Text size={13} color="shy">
                      {weightPercent}%
                    </Text>
                  </HStack>
                ))}
            </VStack>
          }
        />
      )}
    </List>
  )
}
