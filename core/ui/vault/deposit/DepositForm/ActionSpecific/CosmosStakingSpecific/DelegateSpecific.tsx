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

import { StakingAmountInput } from './StakingAmountInput'
import { ValidatorPickerField } from './ValidatorPickerField'

/**
 * Delegate form — Stake LUNA Figma screen. Renders form content only;
 * the bottom CTA is owned by `CosmosStakingFooterButton` at the page
 * footer level so it stays pinned to the screen bottom outside the
 * scrollable action area.
 *
 * The Amount card flex-grows so the layout matches Figma: card fills the
 * vertical space between the header and the Validator field, with the
 * centered amount input absorbing the spare height.
 */
export const DelegateSpecific = () => {
  const { t } = useTranslation()
  const [{ control, setValue, chain }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const balanceUnits = balanceQuery.data ?? 0n
  const balanceUi = fromChainAmount(balanceUnits, coin.decimals)

  return (
    <Layout>
      <Card>
        <Text size={14} color="regular">
          {t('amount')}
        </Text>
        <CenteredAmount>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <StakingAmountInput
                value={(field.value as string | undefined) ?? ''}
                onChange={v =>
                  setValue('amount', v, { shouldValidate: true })
                }
                ticker={coin.ticker}
              />
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
    </Layout>
  )
}

const Layout = styled(VStack).attrs({ flexGrow: true, gap: 16 })``

const Card = styled(VStack).attrs({ gap: 12, flexGrow: true })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`

const CenteredAmount = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`
