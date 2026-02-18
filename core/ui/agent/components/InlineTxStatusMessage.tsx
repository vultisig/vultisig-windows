import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { getColor } from '@lib/ui/theme/getters'
import { FC, memo } from 'react'
import styled, { css, keyframes } from 'styled-components'

import { TxStatusInfo } from '../types'
import { getChainFromString } from '../utils/getChainFromString'

type Props = {
  txStatus: TxStatusInfo
}

const truncateHash = (hash: string) =>
  hash.length > 16 ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : hash

const statusIndicators: Record<string, string> = {
  pending: '\u{23F3}',
  confirmed: '\u{2713}',
  failed: '\u{2717}',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  failed: 'Failed',
}

const InlineTxStatusMessageComponent: FC<Props> = ({ txStatus }) => {
  const { txHash, chain, status, label } = txStatus
  const indicator = statusIndicators[status] || '\u{26A1}'
  const statusLabel = statusLabels[status] || status

  const chainEnum = getChainFromString(chain)
  const explorerUrl = chainEnum
    ? getBlockExplorerUrl({ chain: chainEnum, entity: 'tx', value: txHash })
    : null

  const displayLabel = label ? `${label}: ${statusLabel}` : statusLabel

  return (
    <Line $status={status}>
      <Indicator>{indicator}</Indicator>
      <span>{displayLabel}</span>
      <Hash>{truncateHash(txHash)}</Hash>
      {explorerUrl && (
        <ViewLink href={explorerUrl} target="_blank" rel="noopener noreferrer">
          View &#x2197;
        </ViewLink>
      )}
    </Line>
  )
}

export const InlineTxStatusMessage = memo(InlineTxStatusMessageComponent)

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`

const Line = styled.div<{ $status: string }>`
  font-family: monospace;
  font-size: 13px;
  line-height: 1.4;
  padding: 2px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ $status }) =>
    $status === 'failed'
      ? '#ff5050'
      : $status === 'confirmed'
        ? '#33e6bf'
        : getColor('textSupporting')};
  ${({ $status }) =>
    $status === 'pending' &&
    css`
      animation: ${pulse} 1.2s ease-in-out infinite;
    `};
`

const Indicator = styled.span`
  flex-shrink: 0;
`

const Hash = styled.span`
  opacity: 0.6;
`

const ViewLink = styled.a`
  color: inherit;
  text-decoration: none;
  opacity: 0.8;
  &:hover {
    text-decoration: underline;
    opacity: 1;
  }
`
