import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  limitOrderStatusColor,
  useFormatLimitOrderExpiry,
  useLimitOrderStatusLabels,
} from '@core/ui/vault/swap/limit/tracking/presentation'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { LimitSwapTransactionRecord } from '../../../../transaction-history/core'

const Row = styled.button`
  all: unset;
  cursor: pointer;
  padding: 16px;
  ${borderRadius.lg};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:hover {
    border-color: ${getColor('mist')};
  }

  /* all:unset drops the UA focus ring, which is the only cue a keyboard user
     has for which row is selected. */
  &:focus-visible {
    outline: 2px solid ${getColor('contrast')};
    outline-offset: 2px;
  }
`

/**
 * One tracked order: the pair with the sell amount and guaranteed minimum, the
 * order's own status, and — while resting — the queue's fill split and expiry
 * countdown. Opens the record's detail view.
 */
export const LimitOrderRecordRow = ({
  value,
}: ValueProp<LimitSwapTransactionRecord>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const statusLabel = useLimitOrderStatusLabels()
  const formatExpiry = useFormatLimitOrderExpiry()
  const { data } = value

  const fromAmount = Number(
    fromChainAmount(BigInt(data.fromAmount), data.fromDecimals)
  )

  // Fill progress from the queue's own accounting, shown ONLY for a partial
  // fill: a 0% order has nothing to report beyond its status, and a fully
  // filled one is just "Filled". No fractional digits either — a streaming
  // fill still in motion doesn't have that precision.
  const fillPct = (() => {
    if (!data.deposit || !data.amountIn || data.deposit === '0') return null
    const pct = Number((BigInt(data.amountIn) * 100n) / BigInt(data.deposit))
    return pct > 0 && pct < 100 ? pct : null
  })()

  return (
    <Row
      onClick={() =>
        navigate({ id: 'transactionDetail', state: { id: value.id } })
      }
    >
      <HStack alignItems="center" justifyContent="space-between" fullWidth>
        <HStack alignItems="center" gap={8}>
          {data.fromTokenLogo ? (
            <CoinIcon
              coin={{
                chain: data.fromChain,
                id: data.fromTokenId,
                logo: data.fromTokenLogo,
              }}
              style={{ fontSize: 24 }}
            />
          ) : null}
          <Text size={14} weight={500} color="contrast">
            {`${formatAmount(fromAmount, { precision: 'high' })} ${data.fromToken} → ${data.buyTicker}`}
          </Text>
        </HStack>
        <Text size={13} color={limitOrderStatusColor[data.orderStatus]}>
          {statusLabel[data.orderStatus]}
        </Text>
      </HStack>
      <HStack alignItems="center" justifyContent="space-between" fullWidth>
        <Text size={12} color="shy">
          {`${t('swap_limit_minimum_received')}: ${data.minimumReceived} ${data.buyTicker}`}
        </Text>
        <HStack alignItems="center" gap={8}>
          {fillPct !== null ? (
            <Text size={12} color="supporting">
              {t('swap_limit_progress_filled', { percent: fillPct })}
            </Text>
          ) : null}
          {data.orderStatus === 'resting' &&
          data.timeToExpiryBlocks !== undefined ? (
            <Text size={12} color="shy">
              {`${t('swap_limit_expiry_label')}: ${formatExpiry(data.timeToExpiryBlocks)}`}
            </Text>
          ) : null}
        </HStack>
      </HStack>
    </Row>
  )
}
