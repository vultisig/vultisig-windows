import { ReviewDivider, ReviewRow } from '@core/ui/mpc/keysign/review/ReviewRow'
import { ReviewVaultLine } from '@core/ui/mpc/keysign/review/ReviewVaultLine'
import { useDepositMemo } from '@core/ui/vault/deposit/hooks/useDepositMemo'
import { useDepositKeysignPayloadQuery } from '@core/ui/vault/deposit/keysignPayload/query'
import { useDepositAction } from '@core/ui/vault/deposit/providers/DepositActionProvider'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositData } from '@core/ui/vault/deposit/state/data'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { DepositBlockaidStatus } from './DepositBlockaidStatus'
import { DepositReviewCard } from './DepositReviewCard'
import {
  DepositFeeRow,
  DepositNetworkRow,
  DepositReviewValue,
} from './DepositReviewRows'
import { DepositReviewSheet } from './DepositReviewSheet'

const Missing = () => (
  <Text as="span" size={14} color="shy">
    —
  </Text>
)

/** Review sheet for a THORChain bond or unbond opened from the DeFi tab. */
export const BondOverview = ({ onBack }: OnBackProp) => {
  const { t } = useTranslation()
  const depositData = useDepositData()
  const [coin] = useDepositCoin()
  const [action] = useDepositAction()
  const memo = useDepositMemo()
  const vaultAddress = useCurrentVaultAddress(coin.chain)
  const keysignPayloadQuery = useDepositKeysignPayloadQuery()

  const isUnbond = action === 'unbond'
  const actionLabel = isUnbond
    ? (t('you_are_unbonding') as string)
    : (t('you_are_bonding') as string)

  const rawAmount = depositData?.amount
  const amountValue =
    typeof rawAmount === 'number' ? rawAmount : Number(rawAmount ?? 0)
  const fallbackAmount = Number.isFinite(amountValue) ? amountValue : 0

  const nodeAddress = (depositData?.nodeAddress as string | undefined) ?? ''

  return (
    <DepositReviewSheet title={t('overview')} onBack={onBack}>
      <DepositBlockaidStatus />
      <DepositReviewCard
        label={actionLabel}
        coin={coin}
        fallbackAmount={fallbackAmount}
        keysignPayloadQuery={keysignPayloadQuery}
      />
      <VStack gap={12}>
        <ReviewVaultLine value={vaultAddress} />
        <ReviewDivider />
        <ReviewRow
          label={t('to')}
          value={
            nodeAddress ? (
              <DepositReviewValue>{nodeAddress}</DepositReviewValue>
            ) : (
              <Missing />
            )
          }
        />
        <ReviewDivider />
        <DepositNetworkRow value={coin.chain} />
        <ReviewDivider />
        <ReviewRow
          label={t('memo')}
          value={
            memo ? <DepositReviewValue>{memo}</DepositReviewValue> : <Missing />
          }
        />
        <ReviewDivider />
        <DepositFeeRow />
      </VStack>
    </DepositReviewSheet>
  )
}
