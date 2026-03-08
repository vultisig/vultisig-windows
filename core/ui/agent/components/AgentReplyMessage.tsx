import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AgentOrb } from '../icons/AgentOrb'
import { LoaderIcon } from '../icons/LoaderIcon'
import { MarkdownContent } from './MarkdownContent'

type Props = {
  content?: string
  isAnalyzing: boolean
  analysisDuration?: number
}

export const AgentReplyMessage: FC<Props> = ({
  content,
  isAnalyzing,
  analysisDuration,
}) => {
  const { t } = useTranslation()

  const hasContent = content && content.trim().length > 0

  const statusText = isAnalyzing
    ? t('agent_analyzing')
    : analysisDuration != null
      ? t('agent_analyzed_for', { duration: analysisDuration })
      : t('agent_analyzed')

  return (
    <Container>
      <AgentOrb size={22} />
      <Body>
        <StatusRow>
          <LoaderIcon spinning={isAnalyzing} style={{ fontSize: 16 }} />
          <StatusText>{statusText}</StatusText>
        </StatusRow>
        <ConnectorBox>
          <ConnectorLine />
        </ConnectorBox>
        {hasContent && (
          <ResponseContent>
            <MarkdownContent content={content} />
          </ResponseContent>
        )}
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

const StatusRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${getColor('textShyExtra')};
`

const StatusText = styled.span`
  font-family: 'LCDDot TR', monospace;
  font-size: 20px;
  line-height: 20px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding-top: 2px;
  white-space: nowrap;
`

const ConnectorBox = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ConnectorLine = styled.div`
  width: 1px;
  height: 10px;
  background: ${getColor('foregroundExtra')};
`

const ResponseContent = styled.div`
  padding: 0 2px;
  color: ${getColor('text')};

  & > * {
    font-size: 16px;
    line-height: 24px;
  }
`
