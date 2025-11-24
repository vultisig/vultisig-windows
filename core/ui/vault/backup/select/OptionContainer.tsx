import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { hStack, vStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, OnClickProp, TitleProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const Header = styled.div`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    fullWidth: true,
  })}

  ${text({
    color: 'shy',
  })}
`

const Container = styled(UnstyledButton)`
  padding: 12px;
  ${borderRadius.m};
  font-size: 14px;
  border: 1px solid ${getColor('foregroundExtra')};
  ${vStack({
    gap: 12,
  })}

  &:hover ${Header} {
    color: ${getColor('text')};
  }
`

export const OptionContainer = ({
  children,
  title,
  onClick,
}: ChildrenProp & OnClickProp & TitleProp) => (
  <Container onClick={onClick}>
    <Header>
      {title}
      <ChevronRightIcon fontSize={20} />
    </Header>
    {children}
  </Container>
)
