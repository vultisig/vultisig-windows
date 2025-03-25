import { TitleProp } from '@lib/ui/props'
import { ComponentProps } from 'react'
import styled from 'styled-components'

import { VStack } from '../layout/Stack'
import { Text } from '../text'

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
