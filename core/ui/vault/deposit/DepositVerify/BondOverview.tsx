import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { ReviewDivider } from '../../../mpc/keysign/review/ReviewDivider'
import { ReviewRow } from '../../../mpc/keysign/review/ReviewRow'
import { ReviewTruncatedValue } from '../../../mpc/keysign/review/ReviewTruncatedValue'
import { ReviewVaultLine } from '../../../mpc/keysign/review/ReviewVaultLine'
import { useCurrentVaultAddress } from '../../state/currentVaultCoins'
import { useDepositMemo } from '../hooks/useDepositMemo'
import { useDepositKeysignPayloadQuery } from '../keysignPayload/query'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositData } from '../state/data'
import { DepositBlockaidStatus } from './DepositBlockaidStatus'
import { DepositFeeRow } from './DepositFeeRow'
import { DepositNetworkRow } from './DepositNetworkRow'
import { DepositReviewCard } from './DepositReviewCard'
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
              <ReviewTruncatedValue value={nodeAddress} />
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
          value={memo ? <ReviewTruncatedValue value={memo} /> : <Missing />}
        />
        <ReviewDivider />
        <DepositFeeRow />
      </VStack>
    </DepositReviewSheet>
  )
}
