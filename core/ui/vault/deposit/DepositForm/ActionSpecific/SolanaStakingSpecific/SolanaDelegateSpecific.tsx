import { SolanaValidatorPickerField } from '@core/ui/chain/solana/staking/components/SolanaValidatorPickerField'
import { useSolanaStakeableBalance } from '@core/ui/vault/deposit/hooks/useSolanaStakeableBalance'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { getFieldErrorMessage } from '@core/ui/vault/deposit/utils/getFieldErrorMessage'
import { PercentageSelector } from '@lib/ui/inputs/PercentageSelector'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { attempt } from '@vultisig/lib-utils/attempt'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { Controller, useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { toExactAmountString } from '../../../utils/exactAmountString'
import { StakingAmountInput } from '../CosmosStakingSpecific/StakingAmountInput'

/**
 * Solana delegate (stake) form — mirrors iOS `SolanaDelegateTransactionScreen`.
 * Amount card (centered input + percentage pills + stakeable balance) and a
 * validator picker. The stakeable max reserves the rent-exempt reserve and the
 * base network fee from the liquid balance, since the stake account must be
 * funded with the reserve on top of the delegated amount (the active stake then
 * equals the entered amount). The bottom CTA is owned by
 * `SolanaStakingFooterButton`.
 */
export const SolanaDelegateSpecific = () => {
  const { t } = useTranslation()
  const [{ control, setValue }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const { errors } = useFormState({ control })
  const { rentReserve, stakeable: stakeableUnits } = useSolanaStakeableBalance()

  const stakeableUi = fromChainAmount(stakeableUnits, coin.decimals)
  const rentReserveUi = fromChainAmount(rentReserve, coin.decimals)
  const amountError = getFieldErrorMessage(errors, 'amount')

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
        {amountError ? (
          <Text size={13} color="danger" centerHorizontally>
            {amountError}
          </Text>
        ) : null}
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <PercentageSelector
              max={stakeableUnits}
              value={(() => {
                if (field.value === undefined || field.value === '') return null
                const result = attempt(() =>
                  decimalStringToBigInt(String(field.value), coin.decimals)
                )
                if ('error' in result) return null
                return result.data < 0n ? null : result.data
              })()}
              onChange={units => {
                if (units === null) {
                  setValue('amount', '', { shouldValidate: true })
                  return
                }
                setValue('amount', toExactAmountString(units, coin.decimals), {
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
            {stakeableUi} {coin.ticker}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text size={13} color="regular">
            {t('solana_staking_rent_reserve')}:
          </Text>
          <Text size={14} color="shy">
            {rentReserveUi} {coin.ticker}
          </Text>
        </HStack>
      </Card>
      <Controller
        control={control}
        name="validatorAddress"
        render={({ field }) => (
          <SolanaValidatorPickerField
            ticker={coin.ticker}
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
