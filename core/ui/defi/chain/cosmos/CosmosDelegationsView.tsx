import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { computeValidatorApy } from '@core/ui/chain/cosmos/staking/queries/getCosmosChainApyData'
import { useCosmosChainApyQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosChainApyQuery'
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
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { coinKeyToString, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CosmosDelegationCard } from './CosmosDelegationCard'

// Chain-config `staking.unbonding_time` per chain (in days). 21d is the
// Terra-family default and the Cosmos Hub default. Sourced from a query in
// the long run, but pinned here since it's stable for the launch chains.
const unbondingDaysByChain: Partial<Record<IbcEnabledCosmosChain, number>> = {
  Terra: 21,
  TerraClassic: 21,
}

type CosmosDelegationsViewProps = {
  chain: IbcEnabledCosmosChain
  delegatorAddress: string
  /** Staking-token ticker for display (e.g. LUNA / LUNC). */
  ticker: string
  /** Staking-token base-unit exponent (Terra family = 6). */
  decimals: number
}

export const CosmosDelegationsView = ({
  chain,
  delegatorAddress,
  ticker,
  decimals,
}: CosmosDelegationsViewProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vaultCoins = useCurrentVaultCoins()
  const formatFiatAmount = useFormatFiatAmount()
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

  // Canonical Cosmos staking denom for this chain (e.g. `uluna` for Terra
  // family). The vault-stored `stakingCoin` doesn't carry an `id` field for
  // Terra (`chainFeeCoin[Chain.Terra]` omits it), so anything that needs
  // the denom — APY supply query, reward filtering — must use this map.
  const stakingDenom = cosmosFeeCoinDenom[chain]

  // Same coin-price feed the Portfolio view uses. Routed by the fee coin's
  // `priceProviderId` (e.g. `terra-luna-2`) — matching the Wallet tab.
  // Stays undefined while loading; the UI falls through to `$0.00`.
  const priceCoin = { ...chainFeeCoin[chain], chain }
  const priceQuery = useCoinPricesQuery({ coins: [priceCoin] })
  const priceUsd = priceQuery.data?.[coinKeyToString({ chain })]

  // Chain-wide APY inputs (inflation / bonded_ratio / community_tax).
  // Per-validator APY is computed in the map below using each validator's
  // commission. TerraClassic's inflation is 0 by governance so its APY
  // collapses to 0 — accurate for the inflation portion only.
  const apyQuery = useCosmosChainApyQuery({ chain, stakingDenom })

  if (delegationsQuery.isPending || validatorsQuery.isPending) {
    return (
      <HStack justifyContent="center">
        <Spinner />
      </HStack>
    )
  }

  // No staking coin in the vault — the parent (`StakedPositions`) normally
  // short-circuits to `DefiPositionEmptyState` first, but render an
  // explicit failure here too so the view never silently spins forever
  // if it's reached with a chain the vault hasn't derived.
  if (delegationsQuery.error || validatorsQuery.error || !stakingCoin) {
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
  // Per-validator pending unbondings keyed by valoper. Empty array means
  // no lock for that delegation; the card hides the unbonding line and
  // leaves Unstake enabled.
  const unbondingEntriesByValidator = new Map(
    (unbondingsQuery.data ?? []).map(u => [u.validatorAddress, u.entries])
  )
  const unbondingDays = unbondingDaysByChain[chain] ?? 21

  // Aggregate totals across all delegations for the summary card.
  const totalStakedUnits = delegations.reduce(
    (sum, d) => sum + BigInt(d.balance.amount),
    0n
  )
  const totalStakedUi = fromChainAmount(totalStakedUnits, decimals)
  const totalFiat =
    priceUsd !== undefined ? Number(totalStakedUi) * priceUsd : 0

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
              {formatFiatAmount(totalFiat)}
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
        // Cosmos rewards come back as fractional Dec strings (e.g.
        // "0.251137..uluna"). Sum as Number to preserve fractional
        // precision (truncating to integer uluna wipes out small accruals
        // on fresh stakes). Filter by `stakingDenom` rather than
        // `stakingCoin.id` because some chain fee coin entries (Terra)
        // omit the denom id.
        const stakingDenomRewards = (
          rewardsByValidator.get(d.validatorAddress) ?? []
        )
          .filter(c => c.denom === stakingDenom)
          .reduce((s, c) => s + Number(c.amount), 0)
        const amountUnits = BigInt(d.balance.amount)
        const fiat =
          priceUsd !== undefined
            ? Number(fromChainAmount(amountUnits, decimals)) * priceUsd
            : 0
        const validatorApy = apyQuery.data
          ? computeValidatorApy({
              chainData: apyQuery.data,
              commissionRate: validator.commission.rate,
            })
          : undefined
        return (
          <CosmosDelegationCard
            key={d.validatorAddress}
            validator={validator}
            amount={amountUnits}
            fiat={fiat}
            ticker={ticker}
            decimals={decimals}
            pendingRewardsUnits={stakingDenomRewards}
            apy={validatorApy}
            unbondingEntries={unbondingEntriesByValidator.get(d.validatorAddress)}
            unbondingDays={unbondingDays}
            onAction={action => launchAction(action, d.validatorAddress)}
          />
        )
      })}
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
