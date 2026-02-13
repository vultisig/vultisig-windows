import { HStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ChatLoader = () => {
  return (
    <Container alignItems="center" gap={8}>
      <Spinner />
      <Text size={12} color="shy">
        Thinking...
      </Text>
    </Container>
  )
}

const Container = styled(HStack)`
  padding: 12px 16px;
  background: ${getColor('foreground')};
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  width: fit-content;
`
