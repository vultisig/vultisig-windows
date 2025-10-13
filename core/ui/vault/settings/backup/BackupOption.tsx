import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, OnClickProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const IconContainer = styled(IconWrapper)`
  color: ${getColor('primaryAccentFour')};
  font-size: 24px;
`

const InteractiveIndicator = styled(ChevronRightIcon)`
  color: ${getColor('textShy')};
  font-size: 16px;
`

const Container = styled(UnstyledButton)`
  ${hStack({
    gap: 12,
    alignItems: 'center',
  })}
  ${borderRadius.l};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 16px;

  &:hover ${InteractiveIndicator} {
    color: ${getColor('text')};
  }
`

type InfoItemProps = {
  icon: ReactNode
} & ChildrenProp &
  TitleProp &
  OnClickProp

export const BackupOption = ({
  icon,
  children,
  onClick,
  title,
}: InfoItemProps) => {
  return (
    <Container onClick={onClick}>
      <IconContainer>{icon}</IconContainer>
      <VStack flexGrow alignItems="start" gap={4}>
        <Text size={15} weight="500">
          {title}
        </Text>
        <Text size={13} weight="500" color="shyExtra">
          {children}
        </Text>
      </VStack>
      <InteractiveIndicator />
    </Container>
  )
}
