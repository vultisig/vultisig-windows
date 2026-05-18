import { useCosmosRewardsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosRewardsQuery'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { CosmosChain } from '@vultisig/core-chain/Chain'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getDenom } from '@vultisig/core-chain/coin/utils/getDenom'
import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

/**
 * Claim rewards form — display-only. The form's `validatorAddresses` field
 * (string[]) drives the multi-msg `MsgWithdrawDelegatorReward` keysign
 * payload. Single-validator claims are launched from a delegation card and
 * pass a one-entry array; bulk claims are launched from the Total Staked
 * summary card and pass the full active-delegation list.
 *
 * This component renders the aggregated pending rewards for the validators
 * the user is about to claim from. It does not let the user change the list
 * — that selection happened on the surface that navigated here.
 */
export const ClaimRewardsSpecific = () => {
  const { t } = useTranslation()
  const [{ control, chain }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const validatorAddresses = useWatch({
    control,
    name: 'validatorAddresses',
  }) as string[] | undefined

  const stakingDenom = getDenom(coin as CoinKey<CosmosChain>)

  const rewardsQuery = useCosmosRewardsQuery({
    chain: chain as IbcEnabledCosmosChain,
    delegatorAddress: coin.address,
  })

  // Defensive: if some upstream forgot to set validatorAddresses, log it.
  // The form schema requires min(1), so submit will be blocked anyway.
  useEffect(() => {
    if (!validatorAddresses || validatorAddresses.length === 0) {
      console.warn(
        'ClaimRewardsSpecific: validatorAddresses missing; submission blocked'
      )
    }
  }, [validatorAddresses])

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
          if (!validatorAddresses) return null
          const set = new Set(validatorAddresses)
          const pendingUnits = data.rewards
            .filter(r => set.has(r.validatorAddress))
            .flatMap(r => r.reward)
            .filter(c => c.denom === stakingDenom)
            // Dec-string rewards must be floored to bigint base units.
            .reduce((sum, c) => sum + BigInt(c.amount.split('.')[0] || '0'), 0n)
          const ui = fromChainAmount(pendingUnits, coin.decimals)
          return (
            <Text size={28} weight="500">
              {ui} {coin.ticker}
            </Text>
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
