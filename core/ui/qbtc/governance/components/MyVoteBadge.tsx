import { getColor } from '@lib/ui/theme/getters'
import { QbtcGovVote } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { qbtcVoteOptionLabelKey } from '../presentation'

const primaryChoice = (vote: QbtcGovVote) =>
  [...vote.options].sort((a, b) => b.weight - a.weight)[0]?.option

/** "Voted · Yes" chip surfaced once the vault has voted on a proposal. */
export const MyVoteBadge = ({ vote }: { vote: QbtcGovVote }) => {
  const { t } = useTranslation()
  const choice = primaryChoice(vote)
  if (!choice) return null

  return (
    <Badge>
      {t('qbtc_gov.voted_label', {
        option: t(qbtcVoteOptionLabelKey[choice]),
      })}
    </Badge>
  )
}

const Badge = styled.span`
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
  color: ${getColor('textShy')};
  background: ${getColor('foregroundExtra')};
`
