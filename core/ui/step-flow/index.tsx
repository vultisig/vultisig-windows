import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { FC, ReactNode } from 'react'
import styled from 'styled-components'

type StepFlowProps = {
  content: ReactNode
  footer: ReactNode
  header: ReactNode
}

export const StepFlow: FC<StepFlowProps> = ({ content, footer, header }) => (
  <Layout>
    <HeaderSection>{header}</HeaderSection>
    <ContentSection>{content}</ContentSection>
    <FooterSection>{footer}</FooterSection>
  </Layout>
)

const Layout = styled(VStack)`
  height: 100%;
  width: 100%;
  min-height: 0;
  padding: ${pageConfig.verticalPadding}px ${pageConfig.horizontalPadding}px;
  gap: 24px;
`

const clampedWidth = 'min(520px, 100%)'

const HeaderSection = styled(VStack)`
  width: ${clampedWidth};
  margin: 0 auto;
  gap: 16px;
  align-items: center;
`

const ContentSection = styled(VStack)`
  flex: 1;
  min-height: 0;
  width: min(640px, 100%);
  align-self: center;
  justify-content: center;
  align-items: center;

  canvas,
  img,
  video {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }
`

const FooterSection = styled(VStack)`
  width: ${clampedWidth};
  margin: 0 auto;
  gap: 32px;
  padding-bottom: 24px;
  flex-shrink: 0;
  align-items: center;
`
