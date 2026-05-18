import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { useCosmosRewardsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosRewardsQuery'
import { useCosmosUnbondingsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosUnbondingsQuery'
import { useCosmosValidatorsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosValidatorsQuery'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CosmosDelegationCard } from './CosmosDelegationCard'

type CosmosDelegationsViewProps = {
  chain: IbcEnabledCosmosChain
  delegatorAddress: string
  /** Staking-token ticker for display (e.g. LUNA / LUNC). */
  ticker: string
  /** Staking-token base-unit exponent (Terra family = 6). */
  decimals: number
  /** Spot price in USD for the staking token. */
  priceUsd?: number
}

export const CosmosDelegationsView = ({
  chain,
  delegatorAddress,
  ticker,
  decimals,
  priceUsd,
}: CosmosDelegationsViewProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vaultCoins = useCurrentVaultCoins()
  const delegationsQuery = useCosmosDelegationsQuery({
    chain,
    delegatorAddress,
  })
  const validatorsQuery = useCosmosValidatorsQuery(chain)
  const rewardsQuery = useCosmosRewardsQuery({ chain, delegatorAddress })
  const unbondingsQuery = useCosmosUnbondingsQuery({ chain, delegatorAddress })

  const stakingCoin = vaultCoins.find(
    c => c.chain === chain && c.ticker === ticker
  )

  if (delegationsQuery.isPending || validatorsQuery.isPending || !stakingCoin) {
    return (
      <HStack justifyContent="center">
        <Spinner />
      </HStack>
    )
  }

  if (delegationsQuery.error || validatorsQuery.error) {
    return (
      <HStack justifyContent="center">
        <Text color="danger">{t('failed_to_load')}</Text>
      </HStack>
    )
  }

  const delegations = delegationsQuery.data ?? []
  const validators = validatorsQuery.data ?? []
  const validatorByAddr = new Map(validators.map(v => [v.operatorAddress, v]))
  const rewardsByValidator = new Map(
    (rewardsQuery.data?.rewards ?? []).map(r => [r.validatorAddress, r.reward])
  )

  // Aggregate totals across all delegations for the summary card.
  const totalStakedUnits = delegations.reduce(
    (sum, d) => sum + BigInt(d.balance.amount),
    0n
  )
  const totalStakedUi = fromChainAmount(totalStakedUnits, decimals)
  const totalFiat =
    priceUsd !== undefined ? Number(totalStakedUi) * priceUsd : 0

  // Find the earliest pending unbonding completion across all entries. This
  // backs the "Unlocks <date>" footer line below the delegation cards.
  const allUnbondingEntries = (unbondingsQuery.data ?? []).flatMap(u =>
    u.entries.map(e => e.completionTime)
  )
  const nextUnbonding = allUnbondingEntries.sort()[0]

  const coinKey = extractCoinKey(stakingCoin)

  const launchAction = (
    action: 'delegate' | 'undelegate' | 'redelegate',
    validatorAddress?: string
  ) => {
    navigate({
      id: 'deposit',
      state: {
        coin: coinKey,
        action,
        entryPoint: 'defi',
        form:
          action === 'redelegate'
            ? validatorAddress
              ? { srcValidatorAddress: validatorAddress }
              : undefined
            : validatorAddress
              ? { validatorAddress }
              : undefined,
      },
    })
  }

  return (
    <VStack gap={16}>
      <SummaryCard>
        <HStack gap={16} alignItems="center">
          <CoinIcon coin={stakingCoin} style={{ fontSize: 48 }} />
          <VStack gap={2} flexGrow>
            <Text size={14} color="shy">
              {t('total_staked', { ticker })}
            </Text>
            <Text size={28} weight="500">
              {totalStakedUi} {ticker}
            </Text>
            <Text size={14} color="shy">
              ${totalFiat.toFixed(2)}
            </Text>
          </VStack>
        </HStack>
        <Divider />
        <Button kind="primary" onClick={() => launchAction('delegate')}>
          {t('delegate_to_new_validator')}
        </Button>
      </SummaryCard>

      <Text size={15} weight="500">
        {t('active_delegations')}
      </Text>

      {delegations.length === 0 && (
        <Text size={14} color="shy">
          {t('no_active_delegations')}
        </Text>
      )}

      {delegations.map(d => {
        const validator = validatorByAddr.get(d.validatorAddress)
        if (!validator) return null
        const stakingDenomRewards = (
          rewardsByValidator.get(d.validatorAddress) ?? []
        )
          .filter(c => c.denom === stakingCoin.id)
          .reduce((s, c) => s + BigInt(c.amount.split('.')[0] || '0'), 0n)
        const amountUnits = BigInt(d.balance.amount)
        const fiat =
          priceUsd !== undefined
            ? Number(fromChainAmount(amountUnits, decimals)) * priceUsd
            : 0
        return (
          <CosmosDelegationCard
            key={d.validatorAddress}
            validator={validator}
            amount={amountUnits}
            fiat={fiat}
            ticker={ticker}
            decimals={decimals}
            pendingRewardsUnits={stakingDenomRewards}
            onAction={action => launchAction(action, d.validatorAddress)}
          />
        )
      })}

      {nextUnbonding && (
        <UnbondingFooter>
          <Text size={12} color="shy">
            {t('unbonding_lock_label', { days: 21 })}
          </Text>
          <Text size={12} color="shy">
            {t('unbonding_unlocks_at', {
              date: new Date(nextUnbonding).toLocaleDateString(),
            })}
          </Text>
        </UnbondingFooter>
      )}
    </VStack>
  )
}

const SummaryCard = styled(VStack).attrs({ gap: 16 })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  background: ${getColor('foreground')};
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${getColor('foregroundExtra')};
  margin: 0;
`

const UnbondingFooter = styled(HStack).attrs({
  justifyContent: 'space-between',
})`
  padding: 12px 16px;
`
