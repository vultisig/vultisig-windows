import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { getColor } from '@lib/ui/theme/getters'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

import { TxStatusInfo } from '../types'
import { getChainFromString } from '../utils/getChainFromString'

type Props = {
  txStatus: TxStatusInfo
}

const statusIndicators: Record<string, string> = {
  pending: '\u{23F3}',
  confirmed: '\u{2713}',
  failed: '\u{2717}',
}

const statusLabelKeys = {
  pending: 'agent_tx_pending',
  confirmed: 'agent_tx_confirmed',
  failed: 'agent_tx_failed',
} as const

const txTypeLabelKeys = {
  transfer: 'agent_tx_type_transfer',
  send: 'agent_tx_type_send',
  swap: 'agent_tx_type_swap',
  approval: 'agent_tx_type_approval',
  deposit: 'agent_tx_type_deposit',
  evm_contract: 'agent_tx_type_contract_call',
  wasm_execute: 'agent_tx_type_contract_execute',
} as const

type StatusKey = keyof typeof statusLabelKeys
type TxTypeKey = keyof typeof txTypeLabelKeys

const InlineTxStatusMessageComponent: FC<Props> = ({ txStatus }) => {
  const { t } = useTranslation()
  const { txHash, chain, status, label } = txStatus
  const indicator = statusIndicators[status] || '\u{26A1}'
  const statusLabelKey =
    status in statusLabelKeys ? statusLabelKeys[status as StatusKey] : undefined
  const statusLabel = statusLabelKey ? t(statusLabelKey) : status

  const chainEnum = getChainFromString(chain)
  const explorerUrl = chainEnum
    ? getBlockExplorerUrl({ chain: chainEnum, entity: 'tx', value: txHash })
    : null

  const txTypeLabelKey =
    label && label in txTypeLabelKeys
      ? txTypeLabelKeys[label as TxTypeKey]
      : undefined
  const txLabel = txTypeLabelKey ? t(txTypeLabelKey) : label || undefined
  const displayLabel = txLabel
    ? `${String(txLabel)}: ${String(statusLabel)}`
    : String(statusLabel)

  return (
    <Line $status={status}>
      <Indicator>{indicator}</Indicator>
      <span>{displayLabel}</span>
      {explorerUrl && (
        <ViewLink href={explorerUrl} target="_blank" rel="noopener noreferrer">
          {t('agent_tx_view')} &#x2197;
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

const ViewLink = styled.a`
  color: inherit;
  text-decoration: none;
  opacity: 0.8;
  &:hover {
    text-decoration: underline;
    opacity: 1;
  }
`
