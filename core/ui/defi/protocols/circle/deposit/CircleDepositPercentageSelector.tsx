import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { multiplyBigInt } from '@lib/utils/bigint/bigIntMultiplyByNumber'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CircleDepositPercentageSelectorProps = {
  balance: bigint | null
  currentAmount: bigint | null
  onSelect: (amount: bigint | null) => void
}

const percentages = [0.25, 0.5, 0.75, 1] as const

export const CircleDepositPercentageSelector = ({
  balance,
  currentAmount,
  onSelect,
}: CircleDepositPercentageSelectorProps) => {
  const { t } = useTranslation()

  if (!balance) return null

  const currentPercentage =
    currentAmount !== null ? Number(currentAmount) / Number(balance) : null

  const isActive = (percentage: number) => {
    if (currentPercentage === null) return false
    const tolerance = 0.001
    return Math.abs(currentPercentage - percentage) < tolerance
  }

  return (
    <HStack gap={12} justifyContent="center">
      {percentages.map(percentage => (
        <PercentageButton
          key={percentage}
          isActive={isActive(percentage)}
          onClick={() => onSelect(multiplyBigInt(balance, percentage))}
        >
          <Text size={12} weight="500" color="shy">
            {percentage === 1 ? t('max') : `${Math.round(percentage * 100)}%`}
          </Text>
        </PercentageButton>
      ))}
    </HStack>
  )
}

const PercentageButton = styled(UnstyledButton)<{ isActive: boolean }>`
  flex: 1;
  padding: 4px 16px;
  border-radius: 99px;
  border: 1px solid ${getColor('foregroundExtra')};
  background-color: ${({ isActive }) =>
    isActive ? getColor('buttonPrimary') : getColor('background')};
  ${centerContent}
`
