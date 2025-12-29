import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import {
  DescriptionProp,
  IconProp,
  OnClickProp,
  TitleProp,
} from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled(UnstyledButton)`
  ${vStack({
    gap: 12,
  })}
  border-radius: 24px;
  background: ${getColor('foreground')};
  padding: 24px;
  width: 100%;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const IconContainer = styled.div`
  color: ${getColor('info')};
  font-size: 20px;
`

type ImportOptionProps = IconProp &
  DescriptionProp &
  TitleProp &
  OnClickProp & {
    badge?: ReactNode
    footnote?: ReactNode
  }

export const ImportOption = ({
  icon,
  description,
  onClick,
  title,
  badge,
  footnote,
}: ImportOptionProps) => {
  return (
    <Container onClick={onClick}>
      {badge}
      <HStack gap={8} alignItems="center">
        <IconContainer>{icon}</IconContainer>
        <Text size={15} weight="500">
          {title}
        </Text>
      </HStack>
      <VStack alignItems="start" gap={8}>
        <Text size={13} weight="500" color="shyExtra">
          {description}
        </Text>
        {footnote && (
          <Text size={10} weight="500" color="shy">
            {footnote}
          </Text>
        )}
      </VStack>
    </Container>
  )
}
