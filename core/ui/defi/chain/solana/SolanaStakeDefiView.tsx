import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useSolanaApyInputsQuery } from '@core/ui/chain/solana/staking/queries/useSolanaApyInputsQuery'
import { useSolanaEpochInfoQuery } from '@core/ui/chain/solana/staking/queries/useSolanaEpochInfoQuery'
import { useSolanaStakeAccountsQuery } from '@core/ui/chain/solana/staking/queries/useSolanaStakeAccountsQuery'
import { useSolanaValidatorsQuery } from '@core/ui/chain/solana/staking/queries/useSolanaValidatorsQuery'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useForgetSolanaMoveStakeDestinationsMutation,
  useSolanaMoveStakeDestinations,
} from '@core/ui/storage/solanaMoveStakeDestinations'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { resolveValidatorApy } from '@vultisig/core-chain/chains/solana/staking/apyResolver'
import { solDecimals } from '@vultisig/core-chain/chains/solana/staking/config'
import { evaluateCooldown } from '@vultisig/core-chain/chains/solana/staking/cooldownGate'
import {
  SolanaStakeAccount,
  stakeActivationState,
} from '@vultisig/core-chain/chains/solana/staking/models/stakeAccount'
import {
  networkActivatedStake,
  SolanaValidator,
  truncatedPubkey,
  validatorDisplayName,
  validatorLogoUrl,
} from '@vultisig/core-chain/chains/solana/staking/models/validator'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { coinKeyToString, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SolanaDelegationCard } from './SolanaDelegationCard'

const TotalStakedLogo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`

const TotalStakedLogoFallback = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  font-size: 20px;
`

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
  const formatFiatAmount = useFormatFiatAmount()

  const solCoin = coins.find(c => c.chain === Chain.Solana && !c.id)

  const owner = solCoin?.address ?? ''
  const stakeAccountsQuery = useSolanaStakeAccountsQuery(owner)
  const validatorsQuery = useSolanaValidatorsQuery()
  const epochQuery = useSolanaEpochInfoQuery()
  const apyInputsQuery = useSolanaApyInputsQuery()
  const pricesQuery = useCoinPricesQuery({
    coins: solCoin
      ? [{ ...chainFeeCoin[Chain.Solana], chain: Chain.Solana }]
      : [],
  })

  const moveDestinations = useSolanaMoveStakeDestinations()
  const { mutate: forgetMoveDestinations } =
    useForgetSolanaMoveStakeDestinationsMutation()

  // A recorded move destination is only meaningful while the move is in flight.
  // Once the account is gone (withdrawn) or already delegated to its
  // destination (the move landed), drop it — otherwise it would keep offering
  // "Finish Move" on an account that has nothing left to finish. Only this
  // owner's records are judged: another vault's stake accounts are absent from
  // this list for reasons that have nothing to do with their moves.
  const stakeAccounts = stakeAccountsQuery.data
  useEffect(() => {
    if (!stakeAccounts) return

    const settled = Object.entries(moveDestinations)
      .filter(([pubkey, { owner: destinationOwner, votePubkey }]) => {
        if (destinationOwner !== owner) return false

        const account = stakeAccounts.find(a => a.pubkey === pubkey)
        return !account || account.delegation?.votePubkey === votePubkey
      })
      .map(([pubkey]) => pubkey)

    if (settled.length > 0) {
      forgetMoveDestinations(settled)
    }
  }, [forgetMoveDestinations, moveDestinations, owner, stakeAccounts])

  if (!solCoin) {
    return (
      <Text color="shy">
        {t('solana_staking_total_staked', { ticker: 'SOL' })}
      </Text>
    )
  }

  const priceUsd =
    pricesQuery.data?.[coinKeyToString({ chain: Chain.Solana })] ?? 0

  const validators = validatorsQuery.data ?? []
  const validatorByVote = new Map<string, SolanaValidator>(
    validators.map(v => [v.votePubkey, v])
  )
  // Network-wide activated stake — the fractionStaked denominator for the APY
  // fallback. Must be the full-set sum, not any single validator's stake.
  const totalActivatedStake = networkActivatedStake(validators)
  const currentEpoch = epochQuery.data?.epoch ?? 0n

  const rows = (stakeAccountsQuery.data ?? [])
    .filter(account => account.delegation !== undefined)
    .map(account =>
      buildRow({
        account,
        validatorByVote,
        currentEpoch,
        moveDestination: moveDestinations[account.pubkey]?.votePubkey,
      })
    )
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
        <HStack gap={12} alignItems="center">
          <SafeImage
            src={getChainLogoSrc(Chain.Solana)}
            render={props => <TotalStakedLogo {...props} />}
            fallback={<TotalStakedLogoFallback>◎</TotalStakedLogoFallback>}
          />
          <VStack gap={4}>
            <Text size={14} color="shy">
              {t('solana_staking_total_staked', { ticker: solCoin.ticker })}
            </Text>
            <Text size={24} weight={600}>
              {formatAmount(totalStaked, { ticker: solCoin.ticker })}
            </Text>
            {priceUsd > 0 ? (
              <Text size={13} color="shy">
                {formatFiatAmount(totalStaked * priceUsd)}
              </Text>
            ) : null}
          </VStack>
        </HStack>
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
            const validator = validatorByVote.get(row.votePubkey)
            const apy = validator
              ? resolveValidatorApy({
                  validator,
                  inflationRate: apyInputsQuery.data?.inflationRate,
                  totalSupplyLamports: apyInputsQuery.data?.totalSupplyLamports,
                  totalActivatedStake,
                })
              : undefined
            return (
              <SolanaDelegationCard
                key={row.stakeAccount.pubkey}
                row={row}
                apy={apy}
                ticker={solCoin.ticker}
                priceUsd={priceUsd}
                logoUrl={validator ? validatorLogoUrl(validator) : undefined}
                moveDestinationName={
                  row.moveDestination
                    ? validatorName({
                        votePubkey: row.moveDestination,
                        validatorByVote,
                      })
                    : undefined
                }
                onUnstake={() => onAccountAction('solana_unstake', row)}
                onWithdraw={() => onAccountAction('solana_withdraw', row)}
                onMove={() => onAccountAction('solana_move_stake', row)}
                onFinishMove={() => onAccountAction('solana_finish_move', row)}
                onStake={onDelegate}
              />
            )
          })}
        </VStack>
      ) : null}
    </VStack>
  )

  function onAccountAction(
    action:
      | 'solana_unstake'
      | 'solana_withdraw'
      | 'solana_move_stake'
      | 'solana_finish_move',
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
    if (action === 'solana_move_stake') {
      // The current validator is the one destination the move cannot have, so
      // the picker hides it.
      form.srcValidatorAddress = row.votePubkey
      form.validatorAddress = row.moveDestination
    }
    if (action === 'solana_finish_move') {
      // Re-delegates the whole cooled-down account, so the amount is everything
      // above the rent-exempt reserve — rewards accrued while it was active
      // included. The destination was picked back on the Move step; without one
      // (an account deactivated elsewhere) the finish-move screen still asks.
      form.amount = fromChainAmount(row.withdrawableLamports, solDecimals)
      form.validatorAddress = row.moveDestination
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

type ValidatorNameInput = {
  votePubkey: string
  validatorByVote: Map<string, SolanaValidator>
}

const validatorName = ({ votePubkey, validatorByVote }: ValidatorNameInput) => {
  const validator = validatorByVote.get(votePubkey)

  return validator
    ? validatorDisplayName(validator)
    : truncatedPubkey(votePubkey)
}

export type SolanaStakeRow = {
  stakeAccount: SolanaStakeAccount
  votePubkey: string
  validatorName: string
  state: ReturnType<typeof stakeActivationState>
  delegatedAmount: number
  rentReserve: number
  withdrawableLamports: bigint
  /** Destination vote pubkey of a move in flight, picked on the Move step. */
  moveDestination?: string
  canUnstake: boolean
  canWithdraw: boolean
  canMove: boolean
  canFinishMove: boolean
}

type BuildRowInput = {
  account: SolanaStakeAccount
  validatorByVote: Map<string, SolanaValidator>
  currentEpoch: bigint
  moveDestination?: string
}

const buildRow = ({
  account,
  validatorByVote,
  currentEpoch,
  moveDestination,
}: BuildRowInput): SolanaStakeRow => {
  const votePubkey = account.delegation?.votePubkey ?? ''
  const state = stakeActivationState(account, currentEpoch)
  const cooldown = evaluateCooldown(account, currentEpoch)
  const withdrawableLamports =
    account.lamports > account.rentExemptReserve
      ? account.lamports - account.rentExemptReserve
      : 0n
  // A fully cooled-down account can be re-delegated (finishing a move) just as
  // well as withdrawn — the two share the same gate. Offering finish-move on
  // any cooled-down account, not only one with a recorded destination, keeps
  // accounts deactivated on another device (or before moves were tracked)
  // completable rather than stranded.
  const isCooledDown = state === 'inactive' && cooldown.status === 'available'
  return {
    stakeAccount: account,
    votePubkey,
    validatorName: validatorName({ votePubkey, validatorByVote }),
    state,
    delegatedAmount: Number(
      fromChainAmount(account.delegation?.stake ?? 0n, solDecimals)
    ),
    rentReserve: Number(
      fromChainAmount(account.rentExemptReserve, solDecimals)
    ),
    withdrawableLamports,
    moveDestination,
    canUnstake: state === 'active' || state === 'activating',
    canWithdraw: isCooledDown,
    canMove: state === 'active',
    canFinishMove: isCooledDown && withdrawableLamports > 0n,
  }
}
