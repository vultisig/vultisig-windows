import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

import { Message } from '../state/chatTypes'

type ChatMessageProps = {
  message: Message
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user'

  return (
    <MessageRow justifyContent={isUser ? 'end' : 'start'} fullWidth>
      <MessageBubble isUser={isUser}>
        <Text size={14} color={isUser ? 'regular' : 'contrast'} height="large">
          {message.content}
        </Text>
      </MessageBubble>
    </MessageRow>
  )
}

const MessageRow = styled(HStack)`
  padding: 4px 0;
`

const MessageBubble = styled(VStack)<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;

  ${({ isUser }) =>
    isUser
      ? css`
          background: ${getColor('buttonPrimary')};
          border-bottom-right-radius: 4px;
        `
      : css`
          background: ${getColor('foreground')};
          border-bottom-left-radius: 4px;
        `}
`
