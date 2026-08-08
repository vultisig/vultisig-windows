import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import {
  QbtcGovTally,
  qbtcGovTallyTotal,
} from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { qbtcVoteOptionKeys } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/voteOption'
import styled from 'styled-components'

import { GovColorToken, qbtcVoteOptionColor } from '../presentation'

/** Stacked horizontal bar showing the yes/abstain/no/no-with-veto split. */
export const TallyBar = ({ tally }: { tally: QbtcGovTally }) => {
  const total = qbtcGovTallyTotal(tally)

  return (
    <Track>
      {total === 0n
        ? null
        : qbtcVoteOptionKeys.map(option => {
            const fraction = Number(tally[option]) / Number(total)
            if (fraction <= 0) return null
            return (
              <Segment
                key={option}
                $token={qbtcVoteOptionColor[option]}
                style={{ flexGrow: fraction }}
              />
            )
          })}
    </Track>
  )
}

const Track = styled(HStack)`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: ${getColor('foregroundExtra')};
`

const Segment = styled.div<{ $token: GovColorToken }>`
  height: 100%;
  background: ${({ $token }) => getColor($token)};
`
