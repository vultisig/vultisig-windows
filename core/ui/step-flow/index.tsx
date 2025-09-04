import { VStack } from '@lib/ui/layout/Stack'
import { FC, ReactNode } from 'react'
import styled from 'styled-components'

type StepFlowProps = {
  content: ReactNode
  footer: ReactNode
  header: ReactNode
}

export const StepFlow: FC<StepFlowProps> = ({ content, footer, header }) => (
  <>
    <VStack alignItems="center">
      <VStack gap={16} maxWidth={400} padding="36px 24px 0" fullWidth>
        {header}
      </VStack>
    </VStack>
    <Content alignItems="center">
      <VStack alignItems="center" maxWidth={400} fullSize>
        {content}
      </VStack>
    </Content>
    <Footer alignItems="center">
      <VStack
        alignItems="center"
        gap={32}
        maxWidth={400}
        padding="0 36px 36px"
        fullWidth
      >
        {footer}
      </VStack>
    </Footer>
  </>
)

const Content = styled(VStack)`
  height: 400px;
`

const Footer = styled(VStack)`
  bottom: 0px;
  left: 0;
  position: absolute;
  right: 0;
`
