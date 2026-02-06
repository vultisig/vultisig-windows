import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, ReactNode } from 'react'
import styled from 'styled-components'

type ResultPanelProps = {
  title?: string
  count?: number
  children: ReactNode
}

export const ResultPanel: FC<ResultPanelProps> = ({
  title,
  count,
  children,
}) => {
  return (
    <Container>
      <VStack gap={0}>
        {title && (
          <Header>
            <Text size={12} weight={600} color="supporting">
              {title}
              {count !== undefined && ` (${count})`}
            </Text>
          </Header>
        )}
        <Content>{children}</Content>
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  background: ${getColor('foreground')};
  border-radius: 8px;
  border: 1px solid ${getColor('mist')};
  overflow: hidden;
`

const Header = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid ${getColor('mist')};
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
`
