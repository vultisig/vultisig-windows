import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { QbtcVoteSelection } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { qbtcVoteOptionKeys } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/voteOption'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  GovColorToken,
  qbtcVoteOptionColor,
  qbtcVoteOptionLabelKey,
} from '../presentation'

const step = 5

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

type WeightedVoteSheetProps = {
  onClose: () => void
  onSubmit: (selection: QbtcVoteSelection) => void
}

/** Bottom sheet for composing a weighted vote — percentages must total 100%. */
export const WeightedVoteSheet = ({
  onClose,
  onSubmit,
}: WeightedVoteSheetProps) => {
  const { t } = useTranslation()
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(qbtcVoteOptionKeys.map(option => [option, 25]))
  )

  const total = qbtcVoteOptionKeys.reduce(
    (sum, option) => sum + (weights[option] ?? 0),
    0
  )
  const isValid = total === 100

  const adjust = (option: string, delta: number) =>
    setWeights(prev => ({
      ...prev,
      [option]: clampPercent((prev[option] ?? 0) + delta),
    }))

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({
      kind: 'weighted',
      options: qbtcVoteOptionKeys.map(option => ({
        option,
        weightPercent: weights[option] ?? 0,
      })),
    })
  }

  return (
    <Modal title={t('qbtc_gov.weighted_vote_title')} onClose={onClose}>
      <VStack gap={16}>
        <VStack gap={12}>
          {qbtcVoteOptionKeys.map(option => (
            <HStack
              key={option}
              justifyContent="space-between"
              alignItems="center"
            >
              <HStack alignItems="center" gap={8}>
                <Dot $token={qbtcVoteOptionColor[option]} />
                <Text size={14}>{t(qbtcVoteOptionLabelKey[option])}</Text>
              </HStack>
              <HStack alignItems="center" gap={12}>
                <StepperButton onClick={() => adjust(option, -step)}>
                  −
                </StepperButton>
                <PercentValue>{weights[option] ?? 0}%</PercentValue>
                <StepperButton onClick={() => adjust(option, step)}>
                  +
                </StepperButton>
              </HStack>
            </HStack>
          ))}
        </VStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text size={14} color="shy">
            {t('qbtc_gov.weighted_total')}
          </Text>
          <Text size={14} color={isValid ? 'success' : 'danger'}>
            {total}%
          </Text>
        </HStack>
        <Button kind="primary" disabled={!isValid} onClick={handleSubmit}>
          {t('qbtc_gov.submit_weighted_vote')}
        </Button>
      </VStack>
    </Modal>
  )
}

const Dot = styled.span<{ $token: GovColorToken }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ $token }) => getColor($token)};
`

const PercentValue = styled.span`
  min-width: 44px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${getColor('contrast')};
`

const StepperButton = styled(UnstyledButton)`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('contrast')};
  border: 1px solid ${getColor('foregroundExtra')};
  cursor: pointer;
`
