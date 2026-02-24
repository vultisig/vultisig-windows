import { Button } from '@lib/ui/buttons/Button'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import type { ConfirmationApproval } from '../types'
import { formatToolName } from '../utils/formatToolName'

type Props = {
  approval: ConfirmationApproval
  onApprove: () => void
  onReject: () => void
  onRequestChanges: (feedback: string) => void
}

export const InlineConfirmationCard: FC<Props> = ({
  approval,
  onApprove,
  onReject,
  onRequestChanges,
}) => {
  const { t } = useTranslation()
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')

  const isPending = approval.status === 'pending'

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) return
    onRequestChanges(feedback.trim())
    setShowFeedback(false)
  }

  return (
    <AnimatedVisibility animationConfig="scale">
      <CardContainer>
        <Header>
          <Text size={13} weight={600} color="contrast">
            {formatToolName(approval.action)}
          </Text>
        </Header>
        <DetailsBox>
          <Text size={12} color="supporting" style={{ whiteSpace: 'pre-wrap' }}>
            {approval.details}
          </Text>
        </DetailsBox>
        {isPending ? (
          <VStack gap={8}>
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
            <HStack gap={8}>
              <Button size="sm" onClick={onApprove}>
                {t('approve')}
              </Button>
              <Button size="sm" kind="outlined" onClick={onReject}>
                {t('reject')}
              </Button>
              {!showFeedback && (
                <Button
                  size="sm"
                  kind="secondary"
                  onClick={() => setShowFeedback(true)}
                >
                  {t('agent_request_changes')}
                </Button>
              )}
            </HStack>
          </VStack>
        ) : (
          <StatusBadge $status={approval.status}>
            <Text size={12} weight={600}>
              {approval.status === 'approved' && t('agent_action_approved')}
              {approval.status === 'rejected' && t('agent_action_rejected')}
              {approval.status === 'changes_requested' &&
                t('agent_action_changes_requested')}
            </Text>
          </StatusBadge>
        )}
      </CardContainer>
    </AnimatedVisibility>
  )
}

const CardContainer = styled(VStack)`
  gap: 10px;
  padding: 12px;
  background: ${getColor('foreground')};
  border-radius: 8px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const DetailsBox = styled.div`
  padding: 10px;
  background: ${getColor('foregroundExtra')};
  border-radius: 6px;
  max-height: 160px;
  overflow-y: auto;
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

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('textSupporting')};
  align-self: flex-start;
`
