import { SparklesIcon } from '@lib/ui/icons/SparklesIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChatMessage as ChatMessageType } from '../types'
import { InlineToolCallMessage } from './InlineToolCallMessage'
import { InlineTxStatusMessage } from './InlineTxStatusMessage'
import { MarkdownContent } from './MarkdownContent'

type Props = {
  message: ChatMessageType
}

const ChatMessageComponent: FC<Props> = ({ message }) => {
  const { t } = useTranslation()
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

  return (
    <Container $isUser={isUser}>
      <MessageWrapper $isUser={isUser}>
        {!isUser && (
          <BotAvatar>
            <SparklesIcon />
          </BotAvatar>
        )}
        <VStack gap={8}>
          {!isUser && (
            <Text size={12} color="supporting" weight={600}>
              {t('vultibot')}
            </Text>
          )}
          {hasTextContent && (
            <MessageBubble $isUser={isUser}>
              {isUser ? (
                <Text size={14} style={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Text>
              ) : (
                <MarkdownContent content={message.content} />
              )}
            </MessageBubble>
          )}
        </VStack>
      </MessageWrapper>
    </Container>
  )
}

export const ChatMessage = memo(ChatMessageComponent)

const Container = styled.div<{ $isUser: boolean }>`
  padding: 8px 0;
  display: flex;
  justify-content: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
`

const MessageWrapper = styled.div<{ $isUser: boolean }>`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  max-width: 85%;
`

const BotAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #33e6bf 0%, #0439c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  color: white;
`

const InlineContainer = styled.div`
  padding: 2px 0;
  margin-left: 44px;
`

const MessageBubble = styled.div<{ $isUser: boolean }>`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${({ $isUser, theme }) =>
    $isUser
      ? theme.colors.primary.getVariant({ l: () => 27 }).toCssValue()
      : getColor('foreground')};
  color: ${getColor('contrast')};
`
