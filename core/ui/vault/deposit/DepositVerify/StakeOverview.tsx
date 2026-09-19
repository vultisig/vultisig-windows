import { useCosmosValidatorsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosValidatorsQuery'
import { ReviewDivider, ReviewRow } from '@core/ui/mpc/keysign/review/ReviewRow'
import { ReviewTruncatedValue } from '@core/ui/mpc/keysign/review/ReviewTruncatedValue'
import { ReviewVaultLine } from '@core/ui/mpc/keysign/review/ReviewVaultLine'
import { isBruneStakeCoin } from '@core/ui/vault/deposit/config'
import { useDepositMemo } from '@core/ui/vault/deposit/hooks/useDepositMemo'
import { useDepositKeysignPayloadQuery } from '@core/ui/vault/deposit/keysignPayload/query'
import { useDepositAction } from '@core/ui/vault/deposit/providers/DepositActionProvider'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositData } from '@core/ui/vault/deposit/state/data'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp } from '@lib/ui/props'
import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { StakingChain } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'
import { bruneBondConfig } from '@vultisig/core-chain/chains/cosmos/thor/brune-bond/config'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'

import { DepositBlockaidStatus } from './DepositBlockaidStatus'
import { DepositReviewCard } from './DepositReviewCard'
import { DepositFeeRow, DepositNetworkRow } from './DepositReviewRows'
import { DepositReviewSheet } from './DepositReviewSheet'

/**
 * Review sheet for deposit/stake actions. Renders the action label, amount and
 * fee, swapping the memo row for validator row(s) on Cosmos native staking
 * actions (delegate / undelegate / redelegate / claim). `onBack` returns to
 * the form.
 */
export const StakeOverview = ({ onBack }: OnBackProp) => {
  const { t } = useTranslation()
  const depositData = useDepositData()
  const [coin] = useDepositCoin()
  const [action] = useDepositAction()
  const memo = useDepositMemo()
  const vaultAddress = useCurrentVaultAddress(coin.chain)
  const keysignPayloadQuery = useDepositKeysignPayloadQuery()

  const actionLabels: Record<string, string> = {
    stake: t('you_are_staking'),
    unstake: t('you_are_unstaking'),
    mint: t('you_are_minting'),
    redeem: t('you_are_redeeming'),
    delegate: t('you_are_staking'),
    undelegate: t('you_are_unstaking'),
    redelegate: t('you_are_moving'),
    claim_rewards: t('you_are_claiming'),
  }

  const actionLabel = actionLabels[action] ?? t('you_are_staking')

  // Unstaking bRUNE redeems the ybRUNE receipt shares (NAV is not 1:1), so
  // label the amount as ybRUNE rather than bRUNE.
  const displayCoin =
    action === 'unstake' && isBruneStakeCoin(coin)
      ? { ...coin, ticker: bruneBondConfig.shareTicker }
      : coin

  // Cosmos native staking actions have no on-chain memo (the typed
  // MsgDelegate / MsgUndelegate / etc. carry the data) and they target a
  // validator instead of a recipient address, so the overview swaps the
  // Memo row out for one or two Validator rows.
  const cosmosStakingActions = [
    'delegate',
    'undelegate',
    'redelegate',
    'claim_rewards',
  ] as const
  const isCosmosStakingAction = isOneOf(action, cosmosStakingActions)
  const validatorsQuery = useCosmosValidatorsQuery(
    isCosmosStakingAction ? (coin.chain as StakingChain) : undefined
  )
  const resolveMoniker = (valoper: string | undefined) => {
    if (!valoper) return null
    const v = validatorsQuery.data?.find(x => x.operatorAddress === valoper)
    if (!v) return formatWalletAddress(valoper)
    const commissionPct = (Number(v.commission.rate) * 100).toFixed(0)
    return `${v.description.moniker || formatWalletAddress(valoper)} (${commissionPct}% ${t('commission')})`
  }
  const dstValidator = depositData?.validatorAddress as string | undefined
  const srcValidator = depositData?.srcValidatorAddress as string | undefined
  const claimValidators = depositData?.validatorAddresses as
    | string[]
    | undefined

  // Only real unstake actions can be native TCY unstakes (memo like 'tcy-:5000'),
  // where the transaction amount is 0 and the percentage is encoded in the memo
  const isNativeTcyUnstake = action === 'unstake' && memo?.startsWith('tcy-:')

  const rawAmount = depositData?.amount
  const amountValue =
    typeof rawAmount === 'number' ? rawAmount : Number(rawAmount ?? 0)
  const fallbackAmount = Number.isFinite(amountValue) ? amountValue : 0
  // Exact decimal string for chain-unit conversion — the float fallbackAmount
  // is only for display and zero-checks (#4494)
  const exactAmount =
    rawAmount !== undefined &&
    rawAmount !== null &&
    rawAmount !== '' &&
    Number.isFinite(Number(rawAmount))
      ? String(rawAmount)
      : '0'

  // For native TCY unstaking, the payload.toAmount is '0' because the amount is
  // encoded in the memo as a percentage. We need to use the form amount instead.
  const getPayloadAmount = (payload: KeysignPayload) => {
    const payloadAmount = payload.toAmount
    // If payload amount is 0 or empty, use the form amount (converted to chain units)
    if (!payloadAmount || payloadAmount === '0') {
      return toChainAmount(exactAmount, coin.decimals).toString()
    }
    return payloadAmount
  }

  const validatorValue = (value: string | null) => value ?? '—'

  return (
    <DepositReviewSheet title={t('overview')} onBack={onBack}>
      <DepositBlockaidStatus />
      {/* Hide amount row for native TCY unstake when fallback is 0, as the actual
          amount is determined by THORChain based on the percentage in the memo */}
      {!(isNativeTcyUnstake && fallbackAmount === 0) && (
        <DepositReviewCard
          label={actionLabel}
          coin={displayCoin}
          fallbackAmount={fallbackAmount}
          keysignPayloadQuery={keysignPayloadQuery}
          getPayloadAmount={getPayloadAmount}
        />
      )}
      <VStack gap={12}>
        <ReviewVaultLine value={vaultAddress} />
        {memo ? (
          <>
            <ReviewDivider />
            <ReviewRow
              label={t('memo')}
              value={<ReviewTruncatedValue value={memo} />}
            />
          </>
        ) : null}
        {isCosmosStakingAction && action === 'redelegate' && srcValidator ? (
          <>
            <ReviewDivider />
            <ReviewRow
              label={t('source_validator')}
              value={validatorValue(resolveMoniker(srcValidator))}
            />
          </>
        ) : null}
        {isCosmosStakingAction && action !== 'claim_rewards' && dstValidator ? (
          <>
            <ReviewDivider />
            <ReviewRow
              label={
                action === 'redelegate'
                  ? t('destination_validator')
                  : t('validator')
              }
              value={validatorValue(resolveMoniker(dstValidator))}
            />
          </>
        ) : null}
        {isCosmosStakingAction &&
        action === 'claim_rewards' &&
        claimValidators &&
        claimValidators.length > 0 ? (
          <>
            <ReviewDivider />
            <ReviewRow
              label={t('validator')}
              value={
                claimValidators.length === 1
                  ? validatorValue(resolveMoniker(claimValidators[0]))
                  : t('claim_n_validators', {
                      count: claimValidators.length,
                    })
              }
            />
          </>
        ) : null}
        <ReviewDivider />
        <DepositNetworkRow value={coin.chain} />
        <ReviewDivider />
        <DepositFeeRow />
      </VStack>
    </DepositReviewSheet>
  )
}
