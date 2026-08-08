import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import {
  QbtcGovTally,
  qbtcGovTallyTotal,
} from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { qbtcVoteOptionKeys } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/voteOption'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  GovColorToken,
  qbtcVoteOptionColor,
  qbtcVoteOptionLabelKey,
} from '../presentation'
import { TallyBar } from './TallyBar'

const formatPercent = (fraction: number) => `${(fraction * 100).toFixed(1)}%`

/** Tally bar plus a per-option legend with percentages. */
export const TallyBreakdown = ({ tally }: { tally: QbtcGovTally }) => {
  const { t } = useTranslation()
  const total = qbtcGovTallyTotal(tally)

  return (
    <VStack gap={12}>
      <TallyBar tally={tally} />
      <VStack gap={8}>
        {qbtcVoteOptionKeys.map(option => {
          const fraction =
            total === 0n ? 0 : Number(tally[option]) / Number(total)
          return (
            <HStack
              key={option}
              justifyContent="space-between"
              alignItems="center"
            >
              <HStack alignItems="center" gap={8}>
                <Dot $token={qbtcVoteOptionColor[option]} />
                <Text size={14}>{t(qbtcVoteOptionLabelKey[option])}</Text>
              </HStack>
              <Text size={14} color="shy">
                {formatPercent(fraction)}
              </Text>
            </HStack>
          )
        })}
      </VStack>
    </VStack>
  )
}

const Dot = styled.span<{ $token: GovColorToken }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ $token }) => getColor($token)};
`
