import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, memo } from 'react'
import styled from 'styled-components'

import { AgentMessageTimeline } from '../timeline/AgentMessageTimeline'
import type { AgentStep, TimelineEntry } from '../timeline/TimelineEntry'
import { ChatMessage as ChatMessageType } from '../types'
import { AgentReplyMessage } from './AgentReplyMessage'
import { InlineToolCallMessage } from './InlineToolCallMessage'
import { InlineTxStatusMessage } from './InlineTxStatusMessage'

function buildTimelineEntries(
  steps: AgentStep[],
  content: string
): TimelineEntry[] {
  const entries: TimelineEntry[] = steps.map(step => ({
    kind: 'step' as const,
    ...step,
  }))
  if (content.trim()) {
    entries.push({ kind: 'content', text: content })
  }
  return entries
}

type Props = {
  message: ChatMessageType
  isAnalyzing?: boolean
}

const messageTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
})

const formatMessageTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return messageTimeFormatter.format(date)
}

const ChatMessageComponent: FC<Props> = ({ message, isAnalyzing = false }) => {
  const isUser = message.role === 'user'
  const hasTextContent = message.content.trim().length > 0
  const timestamp = formatMessageTimestamp(message.timestamp)

  const renderTimestamp = () => (
    <UserTimestampSlot>
      {timestamp ? (
        <UserTimestampText
          as="time"
          dateTime={message.timestamp}
          variant="caption"
          color="contrast"
        >
          {timestamp}
        </UserTimestampText>
      ) : null}
    </UserTimestampSlot>
  )

  if (message.steps !== undefined) {
    return (
      <AgentMessageTimeline
        entries={buildTimelineEntries(message.steps, message.content)}
        isAnalyzing={isAnalyzing}
        analysisDuration={message.analysisDuration}
        timestamp={timestamp}
        rawTimestamp={message.timestamp}
      />
    )
  }

  if (message.toolCall) {
    return (
      <InlineContainer>
        <InlineToolCallMessage toolCall={message.toolCall} />
      </InlineContainer>
    )
  }

  if (message.txStatus) {
    return (
      <InlineContainer>
        <InlineTxStatusMessage txStatus={message.txStatus} />
      </InlineContainer>
    )
  }

  if (isUser) {
    if (!hasTextContent) {
      return null
    }

    return (
      <UserRow>
        {renderTimestamp()}
        <UserBubble>
          <Text size={16} style={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Text>
        </UserBubble>
      </UserRow>
    )
  }

  return (
    <AgentReplyMessage
      content={message.content}
      isAnalyzing={isAnalyzing}
      analysisDuration={message.analysisDuration}
      timestamp={timestamp}
      rawTimestamp={message.timestamp}
    />
  )
}

export const ChatMessage = memo(ChatMessageComponent)

const UserTimestampSlot = styled.div`
  width: var(--timestamp-slot-width);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
  transition: opacity 160ms ease;
`

const UserTimestampText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const UserRow = styled.div`
  --timestamp-slot-width: 44px;
  --timestamp-gap: 10px;

  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--timestamp-gap);

  &:hover ${UserTimestampSlot}, &:focus-within ${UserTimestampSlot} {
    opacity: 1;
  }
  padding: 8px 0;
`

const UserBubble = styled.div`
  padding: 10px 14px;
  border-radius: 66px;
  background: ${getColor('foregroundExtra')};
  color: ${getColor('text')};
  max-width: min(
    85%,
    calc(100% - var(--timestamp-slot-width) - var(--timestamp-gap))
  );
`

const InlineContainer = styled.div`
  padding: 2px 0;
`
