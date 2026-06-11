import { ActiveDelegationPicker } from '@core/ui/chain/cosmos/staking/components/ActiveDelegationPicker'
import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { Slider } from '@lib/ui/inputs/Slider'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { StakingChain } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { StakingAmountInput } from './StakingAmountInput'
import { ValidatorPickerField } from './ValidatorPickerField'

/**
 * Redelegate form ("Move"). Source valoper is pre-filled from the card; the
 * user picks an amount and a destination validator. The bottom CTA lives at
 * the page footer (`CosmosStakingFooterButton`) and flips through:
 * Enter Amount → Select Validator → Continue.
 */
export const RedelegateSpecific = () => {
  const { t } = useTranslation()
  const [{ control, setValue, chain }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const srcValidatorAddress = useWatch({
    control,
    name: 'srcValidatorAddress',
  }) as string | undefined

  const delegationsQuery = useCosmosDelegationsQuery({
    chain: chain as StakingChain,
    delegatorAddress: coin.address,
  })

  // Wallet → Function entry has no source pre-filled; show the picker
  // first. The Active Delegations card path passes `srcValidatorAddress`
  // via form-defaults and skips this step. All hooks run unconditionally
  // above so the order is stable across re-renders.
  if (!srcValidatorAddress) {
    return (
      <ActiveDelegationPicker
        chain={chain as StakingChain}
        delegatorAddress={coin.address}
        ticker={coin.ticker}
        decimals={coin.decimals}
        title={t('select_delegation_to_move')}
        onSelect={({ validator }) =>
          setValue('srcValidatorAddress', validator.operatorAddress, {
            shouldValidate: true,
          })
        }
      />
    )
  }

  const stakedUnits = (() => {
    if (!srcValidatorAddress || !delegationsQuery.data) return 0n
    const d = delegationsQuery.data.find(
      x => x.validatorAddress === srcValidatorAddress
    )
    return d ? BigInt(d.balance.amount) : 0n
  })()
  const stakedUi = fromChainAmount(stakedUnits, coin.decimals)

  const handleSliderChange = (percentage: number) => {
    if (stakedUnits === 0n) return
    const units = (stakedUnits * BigInt(Math.round(percentage * 100))) / 10_000n
    setValue('amount', fromChainAmount(units, coin.decimals), {
      shouldValidate: true,
    })
  }

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
                onChange={v => setValue('amount', v, { shouldValidate: true })}
                ticker={coin.ticker}
              />
            )}
          />
        </CenteredAmount>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => {
            // Lone `.` passes the input regex but Number('.') is NaN.
            const rawAmt = Number(field.value ?? 0)
            const amt = Number.isFinite(rawAmt) ? rawAmt : 0
            const rawPct = stakedUi > 0 ? Math.round((amt / stakedUi) * 100) : 0
            const pct = Math.min(100, Math.max(0, rawPct))
            return (
              <Slider
                value={pct}
                onChange={handleSliderChange}
                min={0}
                max={100}
                showLabels
                showDots
              />
            )
          }}
        />
        <HStack justifyContent="space-between">
          <Text size={13} color="regular">
            {t('balance_available')}:
          </Text>
          <Text size={14} color="shy">
            {stakedUi} {coin.ticker}
          </Text>
        </HStack>
      </Card>
      <Controller
        control={control}
        name="validatorAddress"
        render={({ field }) => (
          <ValidatorPickerField
            chain={chain as StakingChain}
            ticker={coin.ticker}
            decimals={coin.decimals}
            value={field.value as string | undefined}
            excludeValidatorAddress={srcValidatorAddress}
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
