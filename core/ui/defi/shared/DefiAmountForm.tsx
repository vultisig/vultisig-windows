import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { HeroAmountInput } from '@lib/ui/inputs/HeroAmountInput'
import { PercentageSelector } from '@lib/ui/inputs/PercentageSelector'
import { Slider } from '@lib/ui/inputs/Slider'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, vStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type DefiAmountFormProps = OnFinishProp<bigint> & {
  balanceQuery: Query<bigint>
  ticker: string
  decimals: number
  /** 'buttons' shows 25/50/75/Max chips (deposit); 'slider' shows a 0–100% slider (withdraw). */
  selector?: 'buttons' | 'slider'
  /** Optional banner rendered between the amount card and the submit button. */
  note?: ReactNode
}

/**
 * Shared DeFi amount entry: hero input + percentage selector/slider + balance
 * row, validating against the provided balance. Used by Circle and VULT staking.
 */
export const DefiAmountForm = ({
  onFinish,
  balanceQuery,
  ticker,
  decimals,
  selector = 'buttons',
  note,
}: DefiAmountFormProps) => {
  const { t } = useTranslation()
  const [amount, setAmount] = useState<bigint | null>(null)

  const balance = balanceQuery.data
  const isAmountExceedsBalance =
    amount !== null && balance !== undefined && amount > balance

  const percentage =
    amount !== null && balance
      ? Math.round((Number(amount) / Number(balance)) * 100)
      : 0

  const isDisabled = (() => {
    if (amount === null || amount === 0n) return true
    if (balance === undefined) return true
    if (isAmountExceedsBalance) return t('send_amount_exceeds_balance')
    return false
  })()

  const handleSubmit = () => {
    onFinish(shouldBePresent(amount))
  }

  return (
    <Form {...getFormProps({ onSubmit: handleSubmit, isDisabled })}>
      <AmountContainer>
        <HStack justifyContent="space-between" alignItems="center">
          <Text size={14} weight="500">
            {t('amount')}
          </Text>
        </HStack>
        <LineSeparator kind="regular" />
        <AmountInputWrapper>
          <HeroAmountInput
            value={amount}
            onChange={setAmount}
            ticker={ticker}
            decimals={decimals}
          />
          <PercentageText size={15} color="shy" $visible={amount !== null}>
            {percentage}%
          </PercentageText>
        </AmountInputWrapper>
        {balance ? (
          selector === 'slider' ? (
            <Slider
              value={percentage}
              onChange={value => setAmount((balance * BigInt(value)) / 100n)}
              min={0}
              max={100}
            />
          ) : (
            <PercentageSelector
              max={balance}
              value={amount}
              onChange={setAmount}
              maxLabel={t('max')}
            />
          )
        ) : null}
        <HStack justifyContent="space-between" alignItems="center">
          <Text size={14} weight="500">
            {t('balance_available')}:
          </Text>
          <Text size={14} color="shy">
            {balance !== undefined
              ? formatAmount(fromChainAmount(balance, decimals), { ticker })
              : '-'}
          </Text>
        </HStack>
      </AmountContainer>
      {note}
      <Button type="submit" disabled={isDisabled}>
        {t('continue')}
      </Button>
    </Form>
  )
}

const Form = styled.form`
  ${vStack({ gap: 16 })}
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`

const AmountContainer = styled.div`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  ${vStack({ gap: 12 })}
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`

const AmountInputWrapper = styled.div`
  ${vStack({ gap: 5 })}
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const PercentageText = styled(Text)<{ $visible: boolean }>`
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
`
