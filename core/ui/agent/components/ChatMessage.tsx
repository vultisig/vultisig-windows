import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, memo } from 'react'
import styled from 'styled-components'

import { ChatMessage as ChatMessageType } from '../types'
import { AgentReplyMessage } from './AgentReplyMessage'
import { InlineToolCallMessage } from './InlineToolCallMessage'
import { InlineTxStatusMessage } from './InlineTxStatusMessage'

type Props = {
  message: ChatMessageType
  isAnalyzing?: boolean
}

const ChatMessageComponent: FC<Props> = ({ message, isAnalyzing = false }) => {
  const isUser = message.role === 'user'
  const hasTextContent = message.content.trim().length > 0

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
    return (
      <UserContainer>
        {hasTextContent && (
          <UserBubble>
            <Text size={16} style={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Text>
          </UserBubble>
        )}
      </UserContainer>
    )
  }

  return (
    <AgentReplyMessage
      content={message.content}
      isAnalyzing={isAnalyzing}
      analysisDuration={message.analysisDuration}
    />
  )
}

export const ChatMessage = memo(ChatMessageComponent)

const UserContainer = styled.div`
  padding: 8px 0;
  display: flex;
  justify-content: flex-end;
`

const UserBubble = styled.div`
  padding: 10px 14px;
  border-radius: 66px;
  background: ${getColor('foregroundExtra')};
  color: ${getColor('text')};
  max-width: 85%;
`

const InlineContainer = styled.div`
  padding: 2px 0;
`
