import { getColor } from '@lib/ui/theme/getters'
import { QbtcProposalStatus } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  GovColorToken,
  qbtcProposalStatusColor,
  qbtcProposalStatusLabelKey,
} from '../presentation'

/** Color-coded pill for a proposal's lifecycle status. */
export const ProposalStatusBadge = ({
  status,
}: {
  status: QbtcProposalStatus
}) => {
  const { t } = useTranslation()
  return (
    <Badge $token={qbtcProposalStatusColor[status]}>
      {t(qbtcProposalStatusLabelKey[status])}
    </Badge>
  )
}

const Badge = styled.span<{ $token: GovColorToken }>`
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
  color: ${({ $token }) => getColor($token)};
  border: 1px solid ${({ $token }) => getColor($token)};
`
