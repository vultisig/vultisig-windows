import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, OnClickProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const IconContainer = styled(IconWrapper)`
  color: ${getColor('textSupporting')};
  font-size: 20px;
`

const Container = styled(UnstyledButton)`
  ${hStack({
    gap: 24,
    alignItems: 'center',
  })}
  ${borderRadius.l};
  background: ${getColor('foreground')};
  padding: 24px;
  width: 100%;

  &:hover {
    background: ${getColor('mist')};
  }
`

type ImportOptionProps = {
  icon: ReactNode
} & ChildrenProp &
  TitleProp &
  OnClickProp

export const ImportOption = ({
  icon,
  children,
  onClick,
  title,
}: ImportOptionProps) => {
  return (
    <Container onClick={onClick}>
      <VStack flexGrow alignItems="start" gap={12}>
        {icon}
        <VStack alignItems="start" gap={12}>
          <Text size={15} weight="500" color="contrast">
            {title}
          </Text>
          <VStack alignItems="start" gap={8}>
            {children}
          </VStack>
        </VStack>
      </VStack>
    </Container>
  )
}

