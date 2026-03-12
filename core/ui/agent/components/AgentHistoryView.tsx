import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChatNotificationIcon } from '../icons/ChatNotificationIcon'
import { PencilWaveIcon } from '../icons/PencilWaveIcon'
import { Conversation } from '../types'

type AgentHistoryViewState = 'loading' | 'loaded' | 'empty' | 'error'

type AgentHistoryViewProps = {
  conversations?: Conversation[]
  error?: string
  onNewChat: () => void
  onOpenChat: (conversationId: string) => void
  onRetry?: () => void
  state: AgentHistoryViewState
}

/** Renders the agent history list and all of its loading and fallback states. */
export const AgentHistoryView: FC<AgentHistoryViewProps> = ({
  conversations = [],
  error,
  onNewChat,
  onOpenChat,
  onRetry,
  state,
}) => {
  const { t } = useTranslation()
  const errorTitle = t('failed_to_load_session_history')
  const errorDescription =
    error && error !== errorTitle
      ? error
      : t('agent_history_load_error_description')

  if (state === 'loading') {
    return (
      <Container>
        <VStack gap={14}>
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard
              key={index}
              height="51px"
              width="100%"
              borderRadius="14px"
            />
          ))}
        </VStack>
      </Container>
    )
  }

  if (state === 'error') {
    return (
      <CenteredContainer>
        <StatusCard>
          <StatusIcon $tone="danger">
            <CircleAlertIcon style={{ fontSize: 24 }} />
          </StatusIcon>
          <VStack gap={8} alignItems="center">
            <Text size={18} weight={500} centerHorizontally>
              {errorTitle}
            </Text>
            <Text size={14} color="shy" centerHorizontally>
              {errorDescription}
            </Text>
          </VStack>
          {onRetry && (
            <Button onClick={onRetry} kind="secondary" size="sm">
              {t('retry')}
            </Button>
          )}
        </StatusCard>
      </CenteredContainer>
    )
  }

  if (state === 'empty') {
    return (
      <CenteredContainer>
        <StatusCard>
          <StatusIcon $tone="accent">
            <ChatNotificationIcon style={{ fontSize: 24 }} />
          </StatusIcon>
          <VStack gap={8} alignItems="center">
            <Text size={18} weight={500} centerHorizontally>
              {t('agent_history_empty_title')}
            </Text>
            <Text size={14} color="shy" centerHorizontally>
              {t('agent_history_empty_description')}
            </Text>
          </VStack>
          <Button
            onClick={onNewChat}
            kind="secondary"
            size="sm"
            icon={<PencilWaveIcon style={{ fontSize: 16 }} />}
          >
            {t('start_new_chat')}
          </Button>
        </StatusCard>
      </CenteredContainer>
    )
  }

  return (
    <Container>
      <VStack gap={14}>
        {conversations.map(conv => (
          <ConversationItem key={conv.id} onClick={() => onOpenChat(conv.id)}>
            <Text size={16} weight={400} height="large" color="contrast">
              {conv.title || t('new_chat')}
            </Text>
          </ConversationItem>
        ))}
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
`

const CenteredContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
`

const StatusCard = styled(VStack)`
  gap: 20px;
  align-items: center;
  width: min(100%, 360px);
  padding: 28px 24px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 20px;
  background: ${getColor('foreground')};
`

const StatusIcon = styled.div<{ $tone: 'accent' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  color: ${({ $tone }) =>
    $tone === 'danger' ? getColor('danger') : getColor('primary')};
  background: ${({ $tone }) =>
    $tone === 'danger'
      ? `${getColor('danger')}14`
      : `${getColor('primary')}14`};
`

const ConversationItem = styled(UnstyledButton)`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${getColor('foreground')};
  }
`

const SkeletonCard = styled(Skeleton)`
  background: ${getColor('foreground')};
`
