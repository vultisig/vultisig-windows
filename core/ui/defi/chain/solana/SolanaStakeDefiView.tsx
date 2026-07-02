import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useSolanaEpochInfoQuery } from '@core/ui/chain/solana/staking/queries/useSolanaEpochInfoQuery'
import { useSolanaStakeAccountsQuery } from '@core/ui/chain/solana/staking/queries/useSolanaStakeAccountsQuery'
import { useSolanaValidatorsQuery } from '@core/ui/chain/solana/staking/queries/useSolanaValidatorsQuery'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { solDecimals } from '@vultisig/core-chain/chains/solana/staking/config'
import { evaluateCooldown } from '@vultisig/core-chain/chains/solana/staking/cooldownGate'
import {
  SolanaStakeAccount,
  stakeActivationState,
} from '@vultisig/core-chain/chains/solana/staking/models/stakeAccount'
import {
  SolanaValidator,
  validatorDisplayName,
} from '@vultisig/core-chain/chains/solana/staking/models/validator'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'

import { SolanaDelegationCard } from './SolanaDelegationCard'

/**
 * Solana native staking on the DeFi tab. Lists the vault's stake accounts as
 * per-account rows (one stake account → one validator), each showing the
 * delegated amount, validator, APY, rent reserve, activation-state badge, and
 * the available actions (Stake / Unstake / Withdraw / Move). Mirrors iOS
 * `SolanaStakeDefiView`. All on-chain reads come from the SDK staking layer via
 * react-query hooks; the metadata seam degrades gracefully on a provider outage.
 */
export const SolanaStakeDefiView = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const coins = useCurrentVaultCoins()

  const solCoin = coins.find(c => c.chain === Chain.Solana && !c.id)

  const owner = solCoin?.address ?? ''
  const stakeAccountsQuery = useSolanaStakeAccountsQuery(owner)
  const validatorsQuery = useSolanaValidatorsQuery()
  const epochQuery = useSolanaEpochInfoQuery()
  const pricesQuery = useCoinPricesQuery({
    coins: solCoin ? [extractCoinKey(solCoin)] : [],
  })

  if (!solCoin) {
    return (
      <Text color="shy">
        {t('solana_staking_total_staked', { ticker: 'SOL' })}
      </Text>
    )
  }

  const priceUsd = solCoin.priceProviderId
    ? (pricesQuery.data?.[solCoin.priceProviderId] ?? 0)
    : 0

  const validatorByVote = new Map<string, SolanaValidator>(
    (validatorsQuery.data ?? []).map(v => [v.votePubkey, v])
  )
  const currentEpoch = epochQuery.data?.epoch ?? 0n

  const rows = (stakeAccountsQuery.data ?? [])
    .filter(account => account.delegation !== undefined)
    .map(account => buildRow({ account, validatorByVote, currentEpoch }))
    .sort((a, b) => b.delegatedAmount - a.delegatedAmount)

  const totalStaked = rows.reduce((sum, r) => sum + r.delegatedAmount, 0)
  const isLoading = stakeAccountsQuery.isPending || epochQuery.isPending

  const onDelegate = () =>
    navigate({
      id: 'deposit',
      state: {
        coin: extractCoinKey(solCoin),
        action: 'solana_delegate',
        entryPoint: 'defi',
      },
    })

  return (
    <VStack gap={12} style={{ marginBottom: 100 }}>
      <VStack
        gap={12}
        style={{
          padding: 16,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <Text size={14} color="shy">
          {t('solana_staking_total_staked', { ticker: solCoin.ticker })}
        </Text>
        <Text size={24} weight={600}>
          {`${totalStaked.toFixed(6)} ${solCoin.ticker}`}
        </Text>
        {priceUsd > 0 ? (
          <Text
            size={13}
            color="shy"
          >{`$${(totalStaked * priceUsd).toFixed(2)}`}</Text>
        ) : null}
        <Button onClick={onDelegate}>
          {t('solana_staking_delegate_new_validator')}
        </Button>
      </VStack>

      {isLoading && rows.length === 0 ? <Spinner /> : null}

      {rows.length > 0 ? (
        <VStack gap={8}>
          <Text size={14} color="supporting">
            {t('solana_staking_stake_accounts')}
          </Text>
          {rows.map(row => {
            return (
              <SolanaDelegationCard
                key={row.stakeAccount.pubkey}
                row={row}
                // APY display lands with the APY resolver in Phase 6; the card
                // hides the row while it is undefined.
                apy={undefined}
                ticker={solCoin.ticker}
                priceUsd={priceUsd}
                onUnstake={() => onAccountAction('solana_unstake', row)}
                onWithdraw={() => onAccountAction('solana_withdraw', row)}
                onMove={() => onAccountAction('solana_move_stake', row)}
                onStake={onDelegate}
              />
            )
          })}
        </VStack>
      ) : null}
    </VStack>
  )

  function onAccountAction(
    action: 'solana_unstake' | 'solana_withdraw' | 'solana_move_stake',
    row: SolanaStakeRow
  ) {
    if (!solCoin) {
      return
    }
    const form: Record<string, unknown> = {
      stakeAccount: row.stakeAccount.pubkey,
    }
    if (action === 'solana_withdraw') {
      form.amount = fromChainAmount(row.withdrawableLamports, solDecimals)
    }
    navigate({
      id: 'deposit',
      state: {
        coin: extractCoinKey(solCoin),
        action,
        entryPoint: 'defi',
        form,
      },
    })
  }
}

export type SolanaStakeRow = {
  stakeAccount: SolanaStakeAccount
  votePubkey: string
  validatorName: string
  state: ReturnType<typeof stakeActivationState>
  delegatedAmount: number
  rentReserve: number
  withdrawableLamports: bigint
  canUnstake: boolean
  canWithdraw: boolean
  canMove: boolean
}

type BuildRowInput = {
  account: SolanaStakeAccount
  validatorByVote: Map<string, SolanaValidator>
  currentEpoch: bigint
}

const buildRow = ({
  account,
  validatorByVote,
  currentEpoch,
}: BuildRowInput): SolanaStakeRow => {
  const votePubkey = account.delegation?.votePubkey ?? ''
  const validator = validatorByVote.get(votePubkey)
  const state = stakeActivationState(account, currentEpoch)
  const cooldown = evaluateCooldown(account, currentEpoch)
  const withdrawableLamports =
    account.lamports > account.rentExemptReserve
      ? account.lamports - account.rentExemptReserve
      : 0n
  return {
    stakeAccount: account,
    votePubkey,
    validatorName: validator
      ? validatorDisplayName(validator)
      : votePubkey.slice(0, 4) + '…' + votePubkey.slice(-4),
    state,
    delegatedAmount: Number(
      fromChainAmount(account.delegation?.stake ?? 0n, solDecimals)
    ),
    rentReserve: Number(
      fromChainAmount(account.rentExemptReserve, solDecimals)
    ),
    withdrawableLamports,
    canUnstake: state === 'active' || state === 'activating',
    canWithdraw: state === 'inactive' && cooldown.status === 'available',
    canMove: state === 'active',
  }
}
