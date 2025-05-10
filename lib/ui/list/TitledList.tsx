import { VStack } from '@lib/ui/layout/Stack'
import { TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { ComponentProps } from 'react'
import styled from 'styled-components'

const Container = styled(VStack)`
  gap: 12px;
`

type TitledListProps = TitleProp &
  Omit<ComponentProps<typeof Container>, 'title'>

export const TitledList = ({ children, title }: TitledListProps) => (
  <Container gap={12}>
    <Text weight="500" size={14} color="contrast">
      {title}
    </Text>
    <VStack gap={8}>{children}</VStack>
  </Container>
)
