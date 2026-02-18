import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import Markdown from 'react-markdown'
import styled from 'styled-components'

type Props = {
  content: string
}

export const MarkdownContent: FC<Props> = ({ content }) => {
  return (
    <Container>
      <Markdown>{content}</Markdown>
    </Container>
  )
}

const Container = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: inherit;

  p {
    margin: 0 0 8px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  code {
    font-family: Menlo, monospace;
    font-size: 12px;
    padding: 2px 6px;
    background: ${getColor('background')};
    border-radius: 4px;
  }

  pre {
    margin: 8px 0;
    padding: 12px;
    background: ${getColor('background')};
    border-radius: 6px;
    overflow-x: auto;

    code {
      padding: 0;
      background: none;
    }
  }

  ul,
  ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }

  a {
    color: ${getColor('primary')};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 12px 0 8px 0;
    font-weight: 600;

    &:first-child {
      margin-top: 0;
    }
  }

  h1 {
    font-size: 18px;
  }

  h2 {
    font-size: 16px;
  }

  h3 {
    font-size: 15px;
  }

  blockquote {
    margin: 8px 0;
    padding: 8px 12px;
    border-left: 3px solid ${getColor('mist')};
    color: ${getColor('textSupporting')};
  }

  hr {
    margin: 12px 0;
    border: none;
    border-top: 1px solid ${getColor('mist')};
  }

  table {
    margin: 8px 0;
    border-collapse: collapse;
    width: 100%;
  }

  th,
  td {
    padding: 8px;
    border: 1px solid ${getColor('mist')};
    text-align: left;
  }

  th {
    background: ${getColor('background')};
    font-weight: 600;
  }
`
