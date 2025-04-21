import { borderRadius } from '@lib/ui/css/borderRadius'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, UiProps } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const IconWrapper = styled.div`
  font-size: 16px;
`

const Container = styled.div`
  ${borderRadius.m};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 16px;
  background-color: ${getColor('foreground')};

  ${hStack({
    fullWidth: true,
    alignItems: 'center',
    gap: 8,
  })}
`

const Content = styled.div`
  flex: 1;
  ${text({
    color: 'contrast',
    weight: '400',
    size: 14,
  })}
`

type WarningBlockProps = ChildrenProp & UiProps

export const InfoBlock = ({ children, ...rest }: WarningBlockProps) => {
  return (
    <Container {...rest}>
      <IconWrapper>
        <InfoIcon />
      </IconWrapper>
      <Content>{children}</Content>
    </Container>
  )
}
