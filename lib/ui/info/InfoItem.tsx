import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled(HStack)`
  ${borderRadius.l};
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 16px;
`

const Content = styled.p`
  ${text({
    color: 'shy',
    size: 13,
    weight: '500',
    height: 'large',
  })};

  b {
    ${text({
      color: 'contrast',
      weight: '500',
    })}
  }
`

const IconContainer = styled(IconWrapper)`
  color: ${getColor('primaryAccentFour')};
  font-size: 24px;
`

type InfoItemProps = {
  icon: ReactNode
} & ChildrenProp

export const InfoItem = ({ icon, children, ...rest }: InfoItemProps) => {
  return (
    <Container alignItems="center" gap={12} {...rest} fullWidth>
      <IconContainer>{icon}</IconContainer>
      <Content>{children}</Content>
    </Container>
  )
}
