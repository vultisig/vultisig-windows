import { ActiveDelegationPicker } from '@core/ui/chain/cosmos/staking/components/ActiveDelegationPicker'
import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { Slider } from '@lib/ui/inputs/Slider'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { StakingAmountInput } from './StakingAmountInput'

/**
 * Undelegate form. Matches the Unstake LUNA Figma screen:
 *   - "Amount" label
 *   - Centered large amount + sub-text percentage
 *   - 0 → 100% slider with labels and dots
 *   - "Balance available" row reflects the staked amount on the selected
 *     validator (not the wallet liquid balance)
 *
 * When entered from a DeFi Active Delegations card, `validatorAddress` is
 * pre-filled via the navigation form-defaults and the picker step is
 * skipped. When entered from the Wallet → Function picker there's no
 * pre-selection, so we first render an `ActiveDelegationPicker` for the
 * user to choose which delegation to unstake from; once picked, the form
 * renders as normal.
 */
export const UndelegateSpecific = () => {
  const { t } = useTranslation()
  const [{ control, setValue, chain }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const validatorAddress = useWatch({ control, name: 'validatorAddress' }) as
    | string
    | undefined

  const delegationsQuery = useCosmosDelegationsQuery({
    chain: chain as IbcEnabledCosmosChain,
    delegatorAddress: coin.address,
  })

  // Wallet → Function entry has no validator pre-filled; show the picker
  // first. The Active Delegations card path passes `validatorAddress` via
  // form-defaults and skips this step. All hooks run unconditionally above
  // so the order is stable across re-renders.
  if (!validatorAddress) {
    return (
      <ActiveDelegationPicker
        chain={chain as IbcEnabledCosmosChain}
        delegatorAddress={coin.address}
        ticker={coin.ticker}
        decimals={coin.decimals}
        title={t('select_delegation_to_unstake')}
        onSelect={({ validator }) =>
          setValue('validatorAddress', validator.operatorAddress, {
            shouldValidate: true,
          })
        }
      />
    )
  }

  const stakedUnits = (() => {
    if (!validatorAddress || !delegationsQuery.data) return 0n
    const d = delegationsQuery.data.find(
      x => x.validatorAddress === validatorAddress
    )
    return d ? BigInt(d.balance.amount) : 0n
  })()
  const stakedUi = fromChainAmount(stakedUnits, coin.decimals)

  const handleSliderChange = (percentage: number) => {
    if (stakedUnits === 0n) return
    // Floor to base units, then re-stringify with the right decimal count.
    const num = (stakedUnits * BigInt(Math.round(percentage * 100))) / 10_000n
    setValue('amount', fromChainAmount(num, coin.decimals), {
      shouldValidate: true,
    })
  }

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
            render={({ field }) => {
              // `Number('.')` is NaN; the input regex `/^\d*\.?\d*$/`
              // accepts a lone `.` so we have to guard here, otherwise
              // the subtitle and slider render NaN%.
              const rawAmt = Number(field.value ?? 0)
              const amt = Number.isFinite(rawAmt) ? rawAmt : 0
              const rawPct =
                stakedUi > 0 ? Math.round((amt / stakedUi) * 100) : 0
              const pct = Math.min(100, Math.max(0, rawPct))
              return (
                <StakingAmountInput
                  value={(field.value as string | undefined) ?? ''}
                  onChange={v =>
                    setValue('amount', v, { shouldValidate: true })
                  }
                  ticker={coin.ticker}
                  subtitle={`${pct}%`}
                />
              )
            }}
          />
        </CenteredAmount>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => {
            const amt = Number(field.value ?? 0)
            const pct = stakedUi > 0 ? Math.round((amt / stakedUi) * 100) : 0
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
  min-height: 240px;
`
