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
}

export const AgentMessageTimeline: FC<Props> = ({
  entries,
  isAnalyzing,
  analysisDuration,
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
      <AgentOrb size={22} />
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  width: 100%;
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
