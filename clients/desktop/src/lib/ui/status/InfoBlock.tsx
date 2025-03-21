import { ChildrenProp, UiProps } from '@lib/ui/props'
import styled from 'styled-components'

import { borderRadius } from '../css/borderRadius'
import { InfoIcon } from '../icons/InfoIcon'
import { hStack } from '../layout/Stack'
import { text } from '../text'
import { getColor } from '../theme/getters'

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
