import { Button } from '@lib/ui/buttons/Button'
import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { animated, useSpring } from '@react-spring/web'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import type { MpcTransaction } from '../orchestrator/types'

type Props = {
  transactions: MpcTransaction[]
  onApprove: (autoApprove: boolean) => void
  onReject: () => void
  onRequestChanges: (feedback: string) => void
}

const txDetailsPriority = [
  'description',
  'amount_human',
  'token_symbol',
  'contract_name',
  'to',
  'gas_limit',
]

function formatDetailKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function truncateAddress(addr: string): string {
  if (addr.length <= 14) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function renderDetails(
  details: Record<string, string>,
  chain: string,
  chainId: string
) {
  const rendered = new Set<string>()
  const rows: Array<{ key: string; label: string; value: string }> = []

  for (const key of txDetailsPriority) {
    if (details[key]) {
      rendered.add(key)
      const value = key === 'to' ? truncateAddress(details[key]) : details[key]
      rows.push({ key, label: formatDetailKey(key), value })
    }
  }

  for (const [key, value] of Object.entries(details)) {
    if (!rendered.has(key) && value) {
      rows.push({ key, label: formatDetailKey(key), value })
    }
  }

  rows.push({ key: '_chain', label: 'Chain', value: `${chain} (${chainId})` })

  return rows.map(row => (
    <DetailRow key={row.key}>
      <Text size={12} color="supporting">
        {row.label}
      </Text>
      <Text size={12} color="contrast" style={{ wordBreak: 'break-all' }}>
        {row.value}
      </Text>
    </DetailRow>
  ))
}

export const TransactionBundleDrawer: FC<Props> = ({
  transactions,
  onApprove,
  onReject,
  onRequestChanges,
}) => {
  const { t } = useTranslation()
  const [autoApprove, setAutoApprove] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')

  const sorted = [...transactions].sort((a, b) => a.sequence - b.sequence)

  const springStyles = useSpring({
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0%)' },
    config: { tension: 300, friction: 30 },
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onReject()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onReject])

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) return
    onRequestChanges(feedback.trim())
  }

  return (
    <BodyPortal>
      <Backdrop onClick={onReject} />
      <DrawerPanel style={springStyles}>
        <DrawerHeader>
          <Text size={16} weight={600} color="contrast">
            {t('review_transactions')}
          </Text>
          <CloseButton onClick={onReject}>&times;</CloseButton>
        </DrawerHeader>
        <DrawerContent>
          <VStack gap={12}>
            {sorted.map((tx, i) => (
              <TransactionCard key={tx.sequence}>
                <Text size={13} weight={600} color="contrast">
                  {t('transaction_n_of_total', {
                    n: i + 1,
                    total: sorted.length,
                  })}{' '}
                  — {tx.action}
                </Text>
                <DetailsGrid>
                  {renderDetails(tx.tx_details, tx.chain, tx.chain_id)}
                </DetailsGrid>
              </TransactionCard>
            ))}
          </VStack>
        </DrawerContent>
        <DrawerFooter>
          {showFeedback && (
            <VStack gap={8}>
              <FeedbackTextarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder={t('agent_request_changes_placeholder')}
                rows={2}
              />
              <Button
                size="sm"
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim()}
              >
                {t('agent_submit_feedback')}
              </Button>
            </VStack>
          )}
          <Checkbox
            value={autoApprove}
            onChange={setAutoApprove}
            label={t('dont_ask_approval_this_session')}
          />
          <Button onClick={() => onApprove(autoApprove)}>{t('approve')}</Button>
          <Button kind="outlined" onClick={onReject}>
            {t('reject')}
          </Button>
          {!showFeedback && (
            <Button kind="secondary" onClick={() => setShowFeedback(true)}>
              {t('agent_request_changes')}
            </Button>
          )}
        </DrawerFooter>
      </DrawerPanel>
    </BodyPortal>
  )
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1000;
`

const DrawerPanel = styled(animated.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  max-width: 90vw;
  background: ${getColor('background')};
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
`

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${getColor('foreground')};
  flex-shrink: 0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${getColor('textSupporting')};
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: ${getColor('contrast')};
  }
`

const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
`

const DrawerFooter = styled(VStack)`
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid ${getColor('foreground')};
  flex-shrink: 0;
`

const TransactionCard = styled(VStack)`
  gap: 8px;
  padding: 12px;
  background: ${getColor('foreground')};
  border-radius: 8px;
`

const DetailsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`

const FeedbackTextarea = styled.textarea`
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid ${getColor('textSupporting')};
  background: ${getColor('foregroundExtra')};
  color: ${getColor('contrast')};
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: ${getColor('primary')};
  }
`
