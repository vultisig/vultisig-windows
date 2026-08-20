import { ActionAmountInputSurface } from '@core/ui/vault/components/action-form/ActionAmountInputSurface'
import { ActionFieldDivider } from '@core/ui/vault/components/action-form/ActionFieldDivider'
import { ActionInputContainer } from '@core/ui/vault/components/action-form/ActionInputContainer'
import { getPercentageShareAmount } from '@core/ui/vault/deposit/utils/percentageShare'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { Slider } from '@lib/ui/inputs/Slider'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type KaminoAmountFieldProps = {
  value: number | null
  onChange: (value: number | null) => void
  ticker: string
  decimals: number
  /** The spendable balance, in human units, that 100% resolves to. */
  balance: number
  /** The same balance in base units — what a percentage is taken of. */
  balanceUnits: bigint
  /** Label for the balance row, e.g. "Balance available" or "Available to withdraw". */
  balanceLabel: string
  error?: string
}

/**
 * Amount entry for the Kamino forms, in the shape the app's other amount
 * steps use: one labelled surface holding a large centred value, a percentage
 * slider, and the balance the percentage is taken of.
 *
 * The percentage resolves against BASE UNITS rather than the displayed
 * figure — taking a fraction of a rounded display value would drift from the
 * balance it claims to be a fraction of.
 */
export const KaminoAmountField = ({
  value,
  onChange,
  ticker,
  decimals,
  balance,
  balanceUnits,
  balanceLabel,
  error,
}: KaminoAmountFieldProps) => {
  const { t } = useTranslation()

  const percentage =
    value === null || balance === 0
      ? 0
      : Math.min(100, Math.round((value / balance) * 100))

  return (
    <ActionInputContainer>
      <Text weight="600" size={16}>
        {t('amount')}
      </Text>
      <ActionFieldDivider />
      <VStack gap={12} flexGrow>
        <ActionAmountInputSurface>
          <AmountTextInput
            value={value}
            onValueChange={onChange}
            placeholder="0"
            shouldBePositive
            unit={ticker}
          />
        </ActionAmountInputSurface>
        {error ? (
          <Text color="danger" size={13}>
            {error}
          </Text>
        ) : null}
        <Slider
          value={percentage}
          onChange={next =>
            onChange(
              Number(
                getPercentageShareAmount({
                  balanceUnits,
                  percentage: next,
                  decimals,
                })
              )
            )
          }
          min={0}
          max={100}
          showLabels
          showDots
        />
        <HStack justifyContent="space-between" alignItems="center">
          <BalanceLabel>{balanceLabel}:</BalanceLabel>
          <BalanceValue>{formatAmount(balance, { ticker })}</BalanceValue>
        </HStack>
      </VStack>
    </ActionInputContainer>
  )
}

const BalanceLabel = styled(Text).attrs({ size: 13 })`
  color: ${getColor('text')};
  line-height: 18px;
`

const BalanceValue = styled(Text).attrs({ size: 14 })`
  color: ${getColor('textShyExtra')};
  line-height: 20px;
`
