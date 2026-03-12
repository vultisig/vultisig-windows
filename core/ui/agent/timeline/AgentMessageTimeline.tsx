import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { MarkdownContent } from '../components/MarkdownContent'
import { AgentOrb } from '../icons/AgentOrb'
import { AgentConnector } from './AgentConnector'
import { AgentStepRow } from './AgentStepRow'
import type { TimelineEntry } from './TimelineEntry'

type Props = {
  entries: TimelineEntry[]
  isAnalyzing?: boolean
  analysisDuration?: number
  timestamp?: string
  rawTimestamp?: string
}

export const AgentMessageTimeline: FC<Props> = ({
  entries,
  isAnalyzing,
  analysisDuration,
  timestamp,
  rawTimestamp,
}) => {
  const { t } = useTranslation()

  const showStatusAsStep =
    isAnalyzing || analysisDuration != null || entries.length === 0

  const statusText = isAnalyzing
    ? t('agent_analyzing')
    : analysisDuration != null
      ? t('agent_analyzed_for', { duration: analysisDuration })
      : t('agent_analyzed')

  const entryNeedsConnectorBefore = entries.map((entry, i) => {
    if (entry.kind !== 'step') return false
    if (i === 0) return showStatusAsStep
    const prev = entries[i - 1]
    return prev.kind === 'step'
  })

  const contentNeedsConnectorAfter = entries.map(
    (entry, i) =>
      entry.kind === 'content' &&
      i < entries.length - 1 &&
      entries[i + 1].kind === 'step'
  )

  return (
    <Container>
      <HeaderRow>
        <AgentOrb size={22} />
        <TimestampSlot>
          {timestamp ? (
            <TimestampText
              as="time"
              dateTime={rawTimestamp}
              variant="caption"
              color="contrast"
            >
              {timestamp}
            </TimestampText>
          ) : null}
        </TimestampSlot>
      </HeaderRow>
      <Body>
        {showStatusAsStep && (
          <AgentStepRow
            step={{
              id: 'status',
              label: statusText,
              category: 'planning',
              iconType: 'loader',
              isActive: isAnalyzing,
            }}
          />
        )}
        {entries.map((entry, i) => {
          if (entry.kind === 'step') {
            return (
              <Fragment key={entry.id}>
                {entryNeedsConnectorBefore[i] && <AgentConnector />}
                <AgentStepRow step={entry} />
              </Fragment>
            )
          }

          if (entry.kind === 'content' && entry.text.trim()) {
            return (
              <Fragment key={`content-${i}`}>
                <ResponseContent>
                  <MarkdownContent content={entry.text} />
                </ResponseContent>
                {contentNeedsConnectorAfter[i] && <AgentConnector />}
              </Fragment>
            )
          }

          return null
        })}
      </Body>
    </Container>
  )
}

const TimestampSlot = styled.div`
  width: var(--timestamp-slot-width);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  transform: translateY(-6px);
  opacity: 0;
  transition: opacity 160ms ease;
`

const TimestampText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Container = styled.div`
  --timestamp-slot-width: 44px;
  --timestamp-gap: 10px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  width: 100%;

  &:hover ${TimestampSlot}, &:focus-within ${TimestampSlot} {
    opacity: 1;
  }
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--timestamp-gap);
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`

const ResponseContent = styled.div`
  padding: 0 2px;
  color: ${getColor('text')};

  & > * {
    font-size: 16px;
    line-height: 24px;
  }
`
