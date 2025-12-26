import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { hStack, VStack } from '@lib/ui/layout/Stack'
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

const IconContainer = styled.div`
  ${hStack({
    alignItems: 'center',
    gap: 8,
  })}
  color: ${getColor('contrast')};

  svg {
    font-size: 20px;
  }
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
      <VStack flexGrow alignItems="start" gap={12}>
        {badge}
        <IconContainer>
          {icon}
          <Text size={15} weight="500" color="contrast">
            {title}
          </Text>
        </IconContainer>
        <VStack alignItems="start" gap={8}>
          <Text size={13} weight="500" color="supporting">
            {description}
          </Text>
          {footnote && (
            <Text size={10} weight="500" color="shy">
              {footnote}
            </Text>
          )}
        </VStack>
      </VStack>
    </Container>
  )
}
