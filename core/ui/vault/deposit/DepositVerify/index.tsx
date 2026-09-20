import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp } from '@lib/ui/props'
import { Fragment, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { getTronStakingDisplay } from '../../../chain/tx/getTronStakingDisplay'
import { ReviewDivider } from '../../../mpc/keysign/review/ReviewDivider'
import { ReviewRow } from '../../../mpc/keysign/review/ReviewRow'
import { ReviewTruncatedValue } from '../../../mpc/keysign/review/ReviewTruncatedValue'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { TrustLineReserveWarning } from '../DepositForm/ActionSpecific/OpenTrustLineSpecific/TrustLineReserveWarning'
import { useDepositFormConfig } from '../hooks/useDepositFormConfig'
import { useDepositMemo } from '../hooks/useDepositMemo'
import { useSender } from '../hooks/useSender'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositData } from '../state/data'
import {
  getTronClaimAmountDisplay,
  tronWithdrawExpireUnfreezeAction,
} from '../tron/withdrawExpireUnfreeze'
import { BondOverview } from './BondOverview'
import { DepositFeeRow } from './DepositFeeRow'
import { DepositReviewSheet } from './DepositReviewSheet'
import { StakeOverview } from './StakeOverview'
import { getFormattedFormData } from './utils'

type Row = {
  key: string
  label: ReactNode
  value: string
}

/**
 * The deposit flow's review sheet. Bond/unbond and the staking actions opened
 * from the DeFi tab get their own overviews; every other action lists the
 * form's fields as it filled them in.
 */
export const DepositVerify = ({ onBack }: OnBackProp) => {
  const [selectedChainAction] = useDepositAction()
  const [coin] = useDepositCoin()
  const depositData = useDepositData()
  const [{ entryPoint }] = useCoreViewState<'deposit'>()

  const memo = useDepositMemo()

  const formattedDepositFormData = getFormattedFormData(
    { ...depositData, memo },
    selectedChainAction,
    coin
  )

  // A TRON freeze/unfreeze memo is an internal marker for the staking contract
  // and never reaches the chain, so show the staked resource the way the other
  // signing device does instead of the raw `FREEZE:<resource>` marker.
  const tronStaking = getTronStakingDisplay({ chain: coin.chain, memo })
  const displayMemo = tronStaking
    ? tronStaking.resource
    : formattedDepositFormData['memo']

  const sender = useSender()
  const { t } = useTranslation()
  const { fields: actionFields } = useDepositFormConfig()

  const isOpenTrustLine = selectedChainAction === 'open_trust_line'
  // The trust-line limit is denominated in the issued currency, not the native
  // XRP fee coin the deposit flow keeps selected.
  const amountTicker = isOpenTrustLine
    ? String(depositData['currency'] ?? '')
    : coin.ticker
  const tronClaimAmount =
    selectedChainAction === tronWithdrawExpireUnfreezeAction
      ? getTronClaimAmountDisplay({
          amount: depositData['amount'],
          ticker: coin.ticker,
        })
      : undefined

  const shouldUseBondOverview =
    entryPoint === 'defi' &&
    (selectedChainAction === 'bond' || selectedChainAction === 'unbond')
  const shouldUseStakeOverview =
    entryPoint === 'defi' &&
    (selectedChainAction === 'stake' ||
      selectedChainAction === 'unstake' ||
      selectedChainAction === 'mint' ||
      selectedChainAction === 'redeem' ||
      selectedChainAction === 'delegate' ||
      selectedChainAction === 'undelegate' ||
      selectedChainAction === 'redelegate' ||
      selectedChainAction === 'claim_rewards')

  if (shouldUseBondOverview) {
    return <BondOverview onBack={onBack} />
  }

  if (shouldUseStakeOverview) {
    return <StakeOverview onBack={onBack} />
  }

  const fieldRows = actionFields.flatMap<Row>(field => {
    if (
      formattedDepositFormData[field.name] == null ||
      formattedDepositFormData[field.name] === '' ||
      field?.name === 'memo'
    ) {
      return []
    }

    const value = String(formattedDepositFormData[field.name])

    return [
      {
        key: field.name,
        label: field.label,
        value:
          (field.type === 'number' || field.type === 'percentage') &&
          field.name === 'amount'
            ? `${value} ${amountTicker}`
            : value,
      },
    ]
  })

  const rows: Row[] = [
    { key: 'from', label: t('from'), value: sender },
    ...(selectedChainAction === tronWithdrawExpireUnfreezeAction
      ? [
          {
            key: 'action',
            label: t('action'),
            value: t(tronWithdrawExpireUnfreezeAction),
          },
          ...(tronClaimAmount
            ? [{ key: 'amount', label: t('amount'), value: tronClaimAmount }]
            : []),
        ]
      : []),
    ...fieldRows,
    ...(selectedChainAction === 'leave'
      ? [{ key: 'amount', label: t('amount'), value: `0 ${coin.ticker}` }]
      : []),
    ...(isOpenTrustLine
      ? [
          {
            key: 'issuer',
            label: t('trust_line_issuer'),
            value: String(depositData['issuer'] ?? ''),
          },
        ]
      : []),
    ...(displayMemo
      ? [{ key: 'memo', label: t('memo'), value: String(displayMemo) }]
      : []),
  ]

  return (
    <DepositReviewSheet title={t('verify')} onBack={onBack}>
      <VStack gap={12}>
        {rows.map(({ key, label, value }, index) => (
          <Fragment key={`${key}-${index}`}>
            {index > 0 && <ReviewDivider />}
            <ReviewRow
              label={label}
              value={<ReviewTruncatedValue value={value} />}
            />
          </Fragment>
        ))}
        <ReviewDivider />
        <DepositFeeRow />
      </VStack>
      {isOpenTrustLine ? <TrustLineReserveWarning /> : null}
    </DepositReviewSheet>
  )
}
