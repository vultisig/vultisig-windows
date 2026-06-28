import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useTonStakePositionQuery } from '@core/ui/chain/ton/staking/queries/useTonStakePositionQuery'
import { StakeCard } from '@core/ui/defi/chain/components/stake/StakeCard'
import { formatDateShort } from '@core/ui/defi/shared/formatters'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { tonStakingWithdrawComment } from '@vultisig/core-chain/chains/ton/staking'
import { coinKeyToString, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'

import { useStakeTonAsSend } from '../hooks/useStakeTonAsSend'

/**
 * TON nominator-pool staking on the DeFi/Earn "Staked" tab. Unlike THORChain
 * and Cosmos staking, the position is read live from tonapi (a wallet stakes
 * into one nominator pool at a time) and is NOT gated behind the per-position
 * opt-in — whenever a stake exists it is shown and counted.
 */
export const TonStakingView = () => {
  const { t, i18n } = useTranslation()
  const navigate = useCoreNavigate()
  const vaultCoins = useCurrentVaultCoins()
  const stakeAsSend = useStakeTonAsSend()

  const tonCoin = vaultCoins.find(coin => coin.chain === Chain.Ton && !coin.id)

  const positionQuery = useTonStakePositionQuery(tonCoin?.address)

  const priceQuery = useCoinPricesQuery({
    coins: tonCoin ? [tonCoin] : [],
  })
  const priceUsd = tonCoin
    ? priceQuery.data?.[coinKeyToString(extractCoinKey(tonCoin))]
    : undefined

  if (!tonCoin) {
    return (
      <VStack gap={8} alignItems="center">
        <Text size={14} color="shy" centerHorizontally>
          {t('ton_stake_chain_not_enabled')}
        </Text>
      </VStack>
    )
  }

  const goToStake = (existing?: { address: string; implementation?: string }) =>
    navigate({
      id: 'tonStake',
      state: {
        existingPoolAddress: existing?.address,
        existingPoolImplementation: existing?.implementation,
      },
    })

  if (positionQuery.isPending) {
    return (
      <StakeCard
        coin={tonCoin}
        title={t('ton_nominator_pool')}
        amount={0n}
        fiat={0}
        isSkeleton
      />
    )
  }

  const position = positionQuery.data

  if (!position) {
    return (
      <VStack gap={16} style={{ marginBottom: 100 }}>
        <VStack gap={8} alignItems="center">
          <Text size={17} weight="600" centerHorizontally>
            {t('ton_stake_empty_title', { ticker: tonCoin.ticker })}
          </Text>
          <Text size={13} color="shy" centerHorizontally>
            {t('ton_stake_empty_description', { ticker: tonCoin.ticker })}
          </Text>
        </VStack>
        <Button kind="primary" onClick={() => goToStake()}>
          {t('ton_stake_cta', { ticker: tonCoin.ticker })}
        </Button>
      </VStack>
    )
  }

  const stakedUi = Number(
    fromChainAmount(position.stakedAmount, tonCoin.decimals)
  )
  const fiat = priceUsd !== undefined ? stakedUi * priceUsd : 0

  const withdrawComment = tonStakingWithdrawComment(position.poolImplementation)
  // Block unstake when no comment can be resolved (unknown pool implementation)
  // — sending a guessed comment would be rejected on-chain.
  const unstakeBlocked = position.withdrawalPending || !withdrawComment

  const unlockDate =
    position.withdrawalUnlockTime !== undefined
      ? new Date(position.withdrawalUnlockTime * 1000)
      : undefined

  const handleUnstake = () => {
    if (unstakeBlocked || !withdrawComment) return
    stakeAsSend({
      coin: tonCoin,
      poolAddress: position.poolAddress,
      memo: withdrawComment,
      kind: 'unstake',
    })
  }

  return (
    <VStack gap={12} style={{ marginBottom: 100 }}>
      <StakeCard
        coin={tonCoin}
        title={position.poolName ?? t('ton_nominator_pool')}
        amount={position.stakedAmount}
        fiat={fiat}
        apr={position.apr}
        canUnstake={!unstakeBlocked}
        unstakeAvailableDate={
          position.withdrawalPending ? unlockDate : undefined
        }
        actionsDisabled={position.withdrawalPending}
        actionsDisabledReason={
          position.withdrawalPending
            ? t('ton_withdrawal_pending', {
                date: unlockDate
                  ? formatDateShort(unlockDate, i18n.language)
                  : t('pending'),
              })
            : undefined
        }
        onStake={() =>
          goToStake({
            address: position.poolAddress,
            implementation: position.poolImplementation,
          })
        }
        onUnstake={handleUnstake}
      />
      {!position.withdrawalPending && !withdrawComment ? (
        <Text size={12} color="warning">
          {t('ton_unstake_unsupported_pool')}
        </Text>
      ) : null}
    </VStack>
  )
}
