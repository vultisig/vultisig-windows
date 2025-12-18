import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { usdc } from '@core/chain/coin/knownTokens'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, vStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CircleAmountInput } from './CircleAmountInput'
import { CirclePercentageSelector } from './CirclePercentageSelector'

type CircleAmountFormProps = OnFinishProp<bigint> & {
  balanceQuery: Query<bigint>
}

export const CircleAmountForm = ({
  onFinish,
  balanceQuery,
}: CircleAmountFormProps) => {
  const { t } = useTranslation()
  const [amount, setAmount] = useState<bigint | null>(null)

  const balance = balanceQuery.data
  const isAmountExceedsBalance =
    amount !== null && balance !== undefined && amount > balance

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
          <CircleAmountInput value={amount} onChange={setAmount} />
          <PercentageText size={15} color="shy" $visible={amount !== null}>
            {amount !== null && balanceQuery.data
              ? `${Math.round((Number(amount) / Number(balanceQuery.data)) * 100)}%`
              : '0%'}
          </PercentageText>
        </AmountInputWrapper>
        <CirclePercentageSelector
          balance={balanceQuery.data ?? null}
          currentAmount={amount}
          onSelect={setAmount}
        />
        <HStack justifyContent="space-between" alignItems="center">
          <Text size={14} weight="500">
            {t('balance_available')}:
          </Text>
          <Text size={14} color="shy">
            {balanceQuery.data
              ? formatAmount(
                  fromChainAmount(balanceQuery.data, usdc.decimals),
                  {
                    ticker: usdc.ticker,
                  }
                )
              : '-'}
          </Text>
        </HStack>
      </AmountContainer>
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
