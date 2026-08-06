import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useTransactionRecordsQuery } from '@core/ui/storage/transactionHistory'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  LimitSwapTransactionRecord,
  TransactionRecord,
} from '../../../../transaction-history/core'
import {
  LimitOrderCancelState,
  useLimitOrderCancel,
} from './useLimitOrderCancel'
import { useLimitOrderCancelKeysignPayloadQuery } from './useLimitOrderCancelKeysignPayloadQuery'

/**
 * Verify + sign the cancellation of a resting limit order.
 *
 * Eligibility is re-resolved here rather than carried through navigation: the
 * order can go terminal, fill, or acquire a duplicate while the user is walking
 * to this screen, and a decision made on the previous screen would then be stale
 * at exactly the moment it gets signed.
 */
export const CancelLimitOrderPage = () => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()
  const [{ id }] = useCoreViewState<'cancelLimitOrder'>()
  // The QUERY, never `useTransactionRecords()`: that helper asserts its data is
  // present, which throws during render on any frame before the storage read
  // resolves. This screen is reached from history so the cache is normally warm,
  // but "normally" is exactly the assumption that took down every signing flow
  // once already.
  const recordsQuery = useTransactionRecordsQuery()
  const records = recordsQuery.data

  const record = records?.find(
    (candidate): candidate is LimitSwapTransactionRecord =>
      candidate.id === id && candidate.type === 'limitSwap'
  )

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={t('swap_limit_cancel_title')}
        hasBorder
      />
      {record && records ? (
        <CancelLimitOrderResolved record={record} records={records} />
      ) : (
        <Body>
          <MatchQuery
            value={recordsQuery}
            pending={() => <Text color="shy">{t('loading')}</Text>}
            // Two different situations, and they are not interchangeable. A
            // failed read means we do not know the order's state; saying it
            // "changed while you were reviewing it" would assert something we
            // cannot see, and send the user looking for a change that may not
            // have happened.
            error={() => (
              <WarningBlock>
                {t('swap_limit_cancel_records_unavailable')}
              </WarningBlock>
            )}
            success={() => (
              <WarningBlock>
                {t('swap_limit_cancel_order_changed')}
              </WarningBlock>
            )}
          />
        </Body>
      )}
    </>
  )
}

type CancelLimitOrderResolvedProps = {
  record: LimitSwapTransactionRecord
  records: TransactionRecord[]
}

/**
 * Split out so `useLimitOrderCancel` only runs once the record exists — a hook
 * cannot be called conditionally, and eligibility is meaningless without one.
 */
const CancelLimitOrderResolved: FC<CancelLimitOrderResolvedProps> = ({
  record,
  records,
}) => {
  const cancel = useLimitOrderCancel({ record, records })

  return <CancelLimitOrderBody cancel={cancel} record={record} />
}

type CancelLimitOrderBodyProps = {
  cancel: LimitOrderCancelState
  record: LimitSwapTransactionRecord
}

/**
 * Split from the page so the ready branch's hooks are never conditional — the
 * keysign payload query only exists once there is a memo and a signing coin to
 * build one from.
 */
const CancelLimitOrderBody: FC<CancelLimitOrderBodyProps> = ({
  cancel,
  record,
}) => {
  const { t } = useTranslation()

  if (!('ready' in cancel)) {
    // Reachable only if the order changed between the previous screen offering
    // the action and this one mounting. Says so rather than showing an inert
    // screen, since the order's real state is one screen back.
    return (
      <Body>
        <WarningBlock>{t('swap_limit_cancel_order_changed')}</WarningBlock>
      </Body>
    )
  }

  return <CancelLimitOrderVerify cancel={cancel.ready} record={record} />
}

type CancelLimitOrderVerifyProps = {
  cancel: Extract<LimitOrderCancelState, { ready: unknown }>['ready']
  record: LimitSwapTransactionRecord
}

const CancelLimitOrderVerify: FC<CancelLimitOrderVerifyProps> = ({
  cancel,
  record,
}) => {
  const { t } = useTranslation()
  const { inputs, memo, signingCoin, indistinguishableOrderCount } = cancel

  const keysignPayloadQuery = useLimitOrderCancelKeysignPayloadQuery({
    signingCoin,
    memo,
  })

  return (
    <VerifyKeysignStart keysignPayloadQuery={keysignPayloadQuery}>
      <VStack gap={16} alignItems="stretch">
        <Card gap={16}>
          <VStack gap={4}>
            <Text size={16} weight={500} color="contrast">
              {t('swap_limit_cancel_verify_title')}
            </Text>
            {/* The order's own pair, in THORChain's raw spelling — the same
                strings the memo carries, so nothing here can disagree with what
                gets signed. */}
            <Text size={13} color="shy">
              {`${inputs.sourceAsset} → ${inputs.targetAsset}`}
            </Text>
          </VStack>
          <Divider />
          <Row
            label={t('swap_limit_cancel_order_label')}
            value={`${record.data.fromToken} → ${record.data.buyTicker}`}
          />
          <MatchQuery
            value={keysignPayloadQuery}
            pending={() => null}
            error={() => null}
            success={keysignPayload =>
              // The attached dust, disclosed as the cost it is rather than as an
              // alarm: an L1 cancel has to send a coin for Bifrost to observe it
              // at all, and THORChain keeps whatever arrives with no refund path.
              // Absent on the THORChain route, where zero is correct.
              BigInt(keysignPayload.toAmount) > 0n ? (
                <Row
                  label={t('swap_limit_cancel_donated_dust_row')}
                  value={formatAmount(
                    fromChainAmount(
                      BigInt(keysignPayload.toAmount),
                      signingCoin.decimals
                    ),
                    { ticker: signingCoin.ticker }
                  )}
                />
              ) : null
            }
          />
          <Row
            label={t('network_fee')}
            value={
              <MatchQuery
                value={keysignPayloadQuery}
                pending={() => t('loading')}
                error={() => t('failed_to_load')}
                success={keysignPayload => (
                  <KeysignFeeAmount keysignPayload={keysignPayload} />
                )}
              />
            }
          />
        </Card>

        {/* What actually happens on-chain. Said plainly because a user
            cancelling a partially filled order otherwise has no way to know the
            filled part is not coming back. */}
        <Text size={12} color="shy">
          {t('swap_limit_cancel_explanation')}
        </Text>

        {indistinguishableOrderCount > 0 ? (
          // THORChain addresses orders by (assets, ratio) + sender and closes
          // the FIRST match — never by tx hash. With more than one identical
          // resting order we cannot promise which closes, so we say so.
          <WarningBlock>
            {t('swap_limit_cancel_duplicate_warning')}
          </WarningBlock>
        ) : null}
      </VStack>
    </VerifyKeysignStart>
  )
}

type RowProps = {
  label: string
  value: ReactNode
}

const Row: FC<RowProps> = ({ label, value }) => (
  <HStack justifyContent="space-between" alignItems="center">
    <Text size={13} color="shy">
      {label}
    </Text>
    <Text size={13} weight={500} color="contrast">
      {value}
    </Text>
  </HStack>
)

const Body = styled(VStack)`
  padding: 16px;
`

const Card = styled(VStack)`
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  border-radius: 12px;
  padding: 16px;
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
`
