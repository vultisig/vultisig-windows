import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useState } from 'react'
import styled from 'styled-components'

import { Action, TxBundle } from '../../types'
import { agentCard } from '../shared/agentCard'
import { AgentCardIcon } from '../shared/AgentCardIcon'
import { TransactionCard } from './TransactionCard'

type TxReviewState = 'review' | 'signing' | 'success' | 'error'

type Props = {
  txBundle: TxBundle
  onSign: (action: Action) => void
  onCancel: () => void
}

export const TxReviewCard: FC<Props> = ({ txBundle, onSign, onCancel }) => {
  const [state, setState] = useState<TxReviewState>('review')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const provider = (txBundle.metadata?.provider as string) ?? null
  const txCount = txBundle.transactions.length

  const handleSign = () => {
    setState('signing')
    setErrorMsg(null)

    const transactions = txBundle.transactions.map(tx => ({
      type: tx.type,
      label: tx.label,
      tx_data: tx.tx_data,
      metadata: tx.metadata,
    }))

    const action: Action = {
      id: `sign-tx-${Date.now()}`,
      type: 'sign_tx',
      title: `Sign ${txCount} transaction${txCount > 1 ? 's' : ''}`,
      params: {
        chain: txBundle.chain,
        sender: txBundle.sender,
        transactions,
      },
      auto_execute: false,
    }

    onSign(action)
  }

  const handleRetry = () => {
    setState('review')
    setErrorMsg(null)
  }

  const bundleTitle =
    txCount === 1 ? txBundle.transactions[0].label : `${txCount} Transactions`

  return (
    <Card $state={state}>
      <VStack gap={16}>
        <HStack alignItems="center" justifyContent="space-between">
          <HStack gap={8} alignItems="center">
            <AgentCardIcon $size={32}>&#x1F4E6;</AgentCardIcon>
            <Text size={15} weight={600}>
              {bundleTitle}
            </Text>
          </HStack>
          {provider && (
            <ProviderBadge>
              <Text size={12} weight={500}>
                via {provider}
              </Text>
            </ProviderBadge>
          )}
        </HStack>

        {txBundle.transactions.map((tx, i) => (
          <TransactionCardContainer key={i}>
            <TransactionCard
              transaction={tx}
              chain={txBundle.chain}
              sender={txBundle.sender}
            />
          </TransactionCardContainer>
        ))}

        {state === 'review' && (
          <HStack gap={8}>
            <Button kind="outlined" onClick={onCancel} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button onClick={handleSign} style={{ flex: 1 }}>
              Sign & Send
            </Button>
          </HStack>
        )}

        {state === 'signing' && <Button loading>Signing...</Button>}

        {state === 'error' && (
          <VStack gap={8}>
            <Text size={13} color="danger">
              {errorMsg || 'Transaction failed'}
            </Text>
            <Button kind="outlined" onClick={handleRetry}>
              Retry
            </Button>
          </VStack>
        )}

        {state === 'success' && (
          <Text size={13} color="primary">
            Transaction submitted
          </Text>
        )}
      </VStack>
    </Card>
  )
}

const Card = styled.div<{ $state: TxReviewState }>`
  ${agentCard}
  padding: 16px;
  border-color: ${({ $state }) => {
    switch ($state) {
      case 'success':
        return getColor('primary')
      case 'error':
        return getColor('danger')
      default:
        return getColor('mist')
    }
  }};
`

const ProviderBadge = styled.div`
  padding: 4px 10px;
  border-radius: 8px;
  background: ${getColor('primary')}18;
  border: 1px solid ${getColor('primary')}40;
  color: ${getColor('primary')};
`

const TransactionCardContainer = styled.div`
  padding: 12px;
  border-radius: 10px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('mist')};
`
