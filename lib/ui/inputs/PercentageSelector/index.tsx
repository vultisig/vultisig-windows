import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { HStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { multiplyBigInt } from '@lib/utils/bigint/bigIntMultiplyByNumber'
import styled from 'styled-components'

type PercentageSelectorProps = InputProps<bigint | null> & {
  max: bigint
  maxLabel?: string
}

const percentages = [0.25, 0.5, 0.75, 1] as const

export const PercentageSelector = ({
  max,
  value,
  onChange,
  maxLabel = 'Max',
}: PercentageSelectorProps) => {
  const currentPercentage = value !== null ? Number(value) / Number(max) : null

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
          $isActive={isActive(percentage)}
          onClick={() => onChange(multiplyBigInt(max, percentage))}
        >
          <Text size={12} weight="500" color="shyExtra">
            {percentage === 1 ? maxLabel : `${Math.round(percentage * 100)}%`}
          </Text>
        </PercentageButton>
      ))}
    </HStack>
  )
}

const PercentageButton = styled(UnstyledButton)<{ $isActive: boolean }>`
  flex: 1;
  padding: 4px 16px;
  border-radius: 99px;
  border: 1px solid ${getColor('foregroundExtra')};
  background-color: ${({ $isActive, theme }) =>
    $isActive
      ? theme.colors.buttonPrimary.toCssValue()
      : theme.colors.background.toCssValue()};
  ${centerContent}
`
