import { IconButton } from '@lib/ui/buttons/IconButton'
import { centeredContentColumn } from '@lib/ui/css/centeredContentColumn'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import styled from 'styled-components'

const contentMaxWidth = 500
const horizontalMinPadding = 24

type ScreenLayoutProps = {
  children: ReactNode
  footer?: ReactNode
  title?: ReactNode
  onBack?: () => void
}

export const ScreenLayout = ({
  children,
  footer,
  title,
  onBack,
}: ScreenLayoutProps) => {
  const hasHeader = !!title || !!onBack

  return (
    <Container>
      {hasHeader && (
        <Header>
          <HeaderContent>
            {onBack && (
              <BackButtonWrapper>
                <IconButton kind="secondary" size="lg" onClick={onBack}>
                  <ChevronLeftIcon />
                </IconButton>
              </BackButtonWrapper>
            )}
            {title && (
              <HeaderTitle as="span" size={18} weight={500} cropped>
                {title}
              </HeaderTitle>
            )}
          </HeaderContent>
        </Header>
      )}
      <ScrollArea>
        <Content>{children}</Content>
      </ScrollArea>
      {footer && <Footer>{footer}</Footer>}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Header = styled.header`
  ${centeredContentColumn({
    contentMaxWidth,
    horizontalMinPadding,
  })}
  flex-shrink: 0;
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 64px;
`

const BackButtonWrapper = styled.div`
  position: absolute;
  left: 0;
`

const HeaderTitle = styled(Text)`
  max-width: 60%;
  text-align: center;
`

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const Content = styled.div`
  width: 100%;
  max-width: ${contentMaxWidth + horizontalMinPadding * 2}px;
  margin: 0 auto;
  padding: 0 ${horizontalMinPadding}px 44px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const Footer = styled.footer`
  ${centeredContentColumn({
    contentMaxWidth,
    horizontalMinPadding,
  })}
  padding-top: 20px;
  padding-bottom: 24px;
  flex-shrink: 0;
`
