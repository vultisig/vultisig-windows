import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { usdc } from '@core/chain/coin/knownTokens'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CircleDepositAmountInput } from './CircleDepositAmountInput'
import { CircleDepositPercentageSelector } from './CircleDepositPercentageSelector'

type CircleDepositFormProps = {
  amount: bigint | null
  onAmountChange: (amount: bigint | null) => void
  onSubmit: () => void
}

export const CircleDepositForm = ({
  amount,
  onAmountChange,
  onSubmit,
}: CircleDepositFormProps) => {
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(Chain.Ethereum)
  const balanceQuery = useBalanceQuery(
    extractAccountCoinKey({ ...usdc, address })
  )

  const isDisabled = amount === null || amount === 0n

  return (
    <Form {...getFormProps({ onSubmit, isDisabled })}>
      <AmountContainer>
        <HStack justifyContent="space-between" alignItems="center">
          <Text size={14} weight="500">
            {t('amount')}
          </Text>
        </HStack>
        <LineSeparator kind="regular" />
        <AmountInputWrapper>
          <CircleDepositAmountInput value={amount} onChange={onAmountChange} />
          {amount !== null && balanceQuery.data && (
            <Text size={15} color="shy">
              {Math.round((Number(amount) / Number(balanceQuery.data)) * 100)}%
            </Text>
          )}
        </AmountInputWrapper>
        <CircleDepositPercentageSelector
          balance={balanceQuery.data ?? null}
          currentAmount={amount}
          onSelect={onAmountChange}
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
