import { getColor } from '@lib/ui/theme/getters'
import { FC, memo } from 'react'
import styled, { css, keyframes } from 'styled-components'

import { ToolCallInfo } from '../types'
import { formatInlineToolCall } from '../utils/inlineToolCalls'

type Props = {
  toolCall: ToolCallInfo
}

const statusIndicators: Record<string, string> = {
  running: '\u{23F3}',
  success: '\u{2713}',
  error: '\u{2717}',
}

const InlineToolCallMessageComponent: FC<Props> = ({ toolCall }) => {
  const indicator = statusIndicators[toolCall.status] || '\u{26A1}'
  const label = formatInlineToolCall(toolCall)

  return (
    <Line $status={toolCall.status}>
      <Indicator>{indicator}</Indicator>
      <span>{label}</span>
      {toolCall.status === 'error' && toolCall.error && (
        <ErrorSuffix> — {toolCall.error}</ErrorSuffix>
      )}
    </Line>
  )
}

export const InlineToolCallMessage = memo(InlineToolCallMessageComponent)

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`

const Line = styled.div<{ $status: string }>`
  font-family: monospace;
  font-size: 13px;
  line-height: 1.4;
  padding: 2px 0;
  color: ${({ $status }) =>
    $status === 'error'
      ? '#ff5050'
      : $status === 'success'
        ? '#33e6bf'
        : getColor('textSupporting')};
  ${({ $status }) =>
    $status === 'running' &&
    css`
      animation: ${pulse} 1.2s ease-in-out infinite;
    `};
`

const Indicator = styled.span`
  margin-right: 6px;
`

const ErrorSuffix = styled.span`
  color: #ff5050;
`
