import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { useCosmosRewardsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosRewardsQuery'
import { stakingDenomForChain } from '@core/ui/chain/cosmos/staking/stakingDenom'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { StakingChain } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'
import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

/**
 * Claim rewards form. The form's `validatorAddresses` field (string[])
 * drives the multi-msg `MsgWithdrawDelegatorReward` keysign payload.
 *
 * Two entry paths:
 *   - From an Active Delegations card: `validatorAddresses` is pre-filled
 *     with one entry (the validator the user clicked Claim on).
 *   - From the Wallet → Function picker with no pre-selection: auto-fill
 *     with the full active-delegation list, since the typical user
 *     intent is "claim everything pending". One tx, N MsgWithdraw msgs.
 *
 * The card renders the aggregate pending reward in the staking denom so
 * the user can see what they're about to claim before signing.
 */
export const ClaimRewardsSpecific = () => {
  const { t } = useTranslation()
  const [{ control, setValue, chain }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const validatorAddresses = useWatch({
    control,
    name: 'validatorAddresses',
  }) as string[] | undefined

  const stakingDenom = stakingDenomForChain(chain as StakingChain)

  const delegationsQuery = useCosmosDelegationsQuery({
    chain: chain as StakingChain,
    delegatorAddress: coin.address,
  })

  const rewardsQuery = useCosmosRewardsQuery({
    chain: chain as StakingChain,
    delegatorAddress: coin.address,
  })

  // When the caller didn't pre-fill `validatorAddresses` (Wallet Function
  // entry), auto-populate from active delegations so the user gets a
  // claim-all by default. Single-validator claims keep their narrower
  // selection unchanged.
  useEffect(() => {
    if (validatorAddresses && validatorAddresses.length > 0) return
    const delegations = delegationsQuery.data
    if (!delegations || delegations.length === 0) return
    setValue(
      'validatorAddresses',
      delegations.map(d => d.validatorAddress),
      { shouldValidate: true }
    )
  }, [validatorAddresses, delegationsQuery.data, setValue])

  return (
    <Card>
      <Text size={14} color="regular">
        {t('pending_rewards')}
      </Text>
      <MatchQuery
        value={rewardsQuery}
        pending={() => <Spinner />}
        error={() => <Text color="danger">{t('failed_to_load_rewards')}</Text>}
        success={data => {
          if (!validatorAddresses || validatorAddresses.length === 0) {
            return (
              <Text size={14} color="shy">
                {t('no_active_delegations')}
              </Text>
            )
          }
          const set = new Set(validatorAddresses)
          // Sum as Number to preserve fractional uluna — sub-base-unit
          // rewards on fresh stakes would otherwise floor to 0.
          const pendingUluna = data.rewards
            .filter(r => set.has(r.validatorAddress))
            .flatMap(r => r.reward)
            .filter(c => c.denom === stakingDenom)
            .reduce((s, c) => s + Number(c.amount), 0)
          const ui = pendingUluna / 10 ** coin.decimals
          // JS Number / 10**6 yields full float precision (17 digits) that
          // overflows the row. Cap at 6 decimals and trim trailing zeros so
          // tiny rewards still show meaningfully without garbage tail.
          const display = ui.toFixed(6).replace(/\.?0+$/, '')
          return (
            <VStack gap={4}>
              <Text size={28} weight="500">
                {display} {coin.ticker}
              </Text>
              <Text size={13} color="shy">
                {t('claim_n_validators', {
                  count: validatorAddresses.length,
                })}
              </Text>
            </VStack>
          )
        }}
      />
    </Card>
  )
}

const Card = styled(VStack).attrs({ gap: 8 })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`
