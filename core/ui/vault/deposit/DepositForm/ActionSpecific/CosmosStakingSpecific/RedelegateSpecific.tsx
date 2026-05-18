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

import { ValidatorPickerField } from './ValidatorPickerField'

/**
 * Redelegate form ("Move" action on the Active Delegations card). The source
 * valoper is preselected (passed via form defaults from the card). The user
 * picks an amount and a destination validator — the picker excludes the
 * source so the same valoper can't be both src and dst.
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
    chain: chain as IbcEnabledCosmosChain,
    delegatorAddress: coin.address,
  })

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
      <Controller
        control={control}
        name="validatorAddress"
        render={({ field }) => (
          <ValidatorPickerField
            chain={chain as IbcEnabledCosmosChain}
            ticker={coin.ticker}
            decimals={coin.decimals}
            value={field.value as string | undefined}
            excludeValidatorAddress={srcValidatorAddress}
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
