import { SparklesIcon } from '@lib/ui/icons/SparklesIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { StreamingSegment } from '../hooks/useAgentEvents'
import { ToolCall } from '../types'
import { ToolCallDisplay } from './ToolCallDisplay'

type Props = {
  segments: StreamingSegment[]
  toolResults: ToolCall[]
}

export const StreamingText: FC<Props> = ({ segments, toolResults }) => {
  const { t } = useTranslation()
  const hasContent = segments.length > 0 || toolResults.length > 0

  if (!hasContent) return null

  return (
    <Container>
      <MessageWrapper>
        <BotAvatar>
          <SparklesIcon />
        </BotAvatar>
        <VStack gap={8}>
          <Text size={12} color="supporting" weight={600}>
            {t('vultibot')}
          </Text>
          {segments.map((segment, idx) => {
            if (segment.type === 'text') {
              return (
                <MessageBubble key={`text-${idx}`}>
                  <Text size={14} style={{ whiteSpace: 'pre-wrap' }}>
                    {segment.content}
                  </Text>
                  {idx === segments.length - 1 && <Cursor />}
                </MessageBubble>
              )
            }
            if (segment.type === 'toolCalls') {
              return (
                <VStack gap={4} key={`tools-${idx}`}>
                  {segment.calls.map(tc => (
                    <ToolCallDisplay key={tc.id} toolCall={tc} showOutput />
                  ))}
                </VStack>
              )
            }
            return null
          })}
        </VStack>
      </MessageWrapper>
    </Container>
  )
}

const Container = styled.div`
  padding: 8px 0;
  display: flex;
  justify-content: flex-start;
`

const MessageWrapper = styled.div`
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

const MessageBubble = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
`

const Cursor = styled.span`
  display: inline-block;
  width: 8px;
  height: 16px;
  background: ${getColor('primary')};
  animation: blink 1s infinite;

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }
`
