import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { vStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { ActionProp, TitleProp } from '@lib/ui/props'
import { gradientText, text } from '@lib/ui/text'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type MigrateInfoScreenProps = {
  art: ReactNode
} & TitleProp &
  ActionProp

const contentMaxWidth = 560

const Container = styled.div`
  ${vStack({
    gap: 40,
    flexGrow: true,
  })}
`

const Content = styled.div`
  ${vStack({
    flexGrow: true,
  })}

  > * {
    &:first-child {
      max-height: ${toSizeUnit(contentMaxWidth)};
    }
  }
`

const PrimaryText = styled.p`
  ${text({ size: 32, color: 'contrast', centerHorizontally: true })}

  b {
    font-weight: inherit;
    ${gradientText}
  }
`

export const MigrateInfoScreen = ({
  art,
  title,
  action,
}: MigrateInfoScreenProps) => {
  const { t } = useTranslation()

  return (
    <>
      <FlowPageHeader title={t('upgrade_vault')} />
      <FitPageContent contentMaxWidth={contentMaxWidth}>
        <Container>
          <Content>
            {art}
            <PrimaryText>{title}</PrimaryText>
          </Content>
          {action}
        </Container>
      </FitPageContent>
    </>
  )
}
