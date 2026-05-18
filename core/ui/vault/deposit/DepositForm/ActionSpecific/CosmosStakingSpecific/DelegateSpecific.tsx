import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { PercentageSelector } from '@lib/ui/inputs/PercentageSelector'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ValidatorPickerField } from './ValidatorPickerField'

/**
 * Delegate form. Matches the Stake LUNA Figma screen:
 *   - "Amount" label and a centered large amount value
 *   - 25 / 50 / 75 / Max percentage pills
 *   - "Balance available" row
 *   - "Validator" field below the amount card; opens picker on click
 *
 * The form's `validatorAddress` field is what the keysign payload builder
 * picks up for MsgDelegate.validator_address.
 */
export const DelegateSpecific = () => {
  const { t } = useTranslation()
  const [{ control, setValue, chain }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const balanceUnits = balanceQuery.data ?? 0n
  const balanceUi = fromChainAmount(balanceUnits, coin.decimals)

  return (
    <VStack gap={16}>
      <Card>
        <Text size={14} color="regular">
          {t('amount')}
        </Text>
        <CenteredAmount>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <Text size={34} weight="500">
                {field.value
                  ? `${field.value} ${coin.ticker}`
                  : `0 ${coin.ticker}`}
              </Text>
            )}
          />
        </CenteredAmount>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <PercentageSelector
              max={balanceUnits}
              value={
                field.value !== undefined && field.value !== ''
                  ? BigInt(
                      Math.floor(Number(field.value) * 10 ** coin.decimals)
                    )
                  : null
              }
              onChange={units => {
                if (units === null) {
                  setValue('amount', '', { shouldValidate: true })
                  return
                }
                setValue('amount', fromChainAmount(units, coin.decimals), {
                  shouldValidate: true,
                })
              }}
            />
          )}
        />
        <HStack justifyContent="space-between">
          <Text size={13} color="regular">
            {t('balance_available')}:
          </Text>
          <Text size={14} color="shy">
            {balanceUi} {coin.ticker}
          </Text>
        </HStack>
      </Card>
      <Controller
        control={control}
        name="validatorAddress"
        render={({ field }) => (
          <ValidatorPickerField
            chain={chain as IbcEnabledCosmosChain}
            ticker={coin.ticker}
            decimals={coin.decimals}
            value={field.value as string | undefined}
            onChange={field.onChange}
          />
        )}
      />
    </VStack>
  )
}

const Card = styled(VStack).attrs({ gap: 12 })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`

const CenteredAmount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`
