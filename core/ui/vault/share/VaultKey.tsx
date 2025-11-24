import { HStack } from '@lib/ui/layout/Stack'
import { TitleProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

const StyledText = styled(Text)`
  align-self: flex-start;
`

export const VaultKey = ({ value, title }: ValueProp<string> & TitleProp) => (
  <HStack alignItems="center" gap={4}>
    <StyledText color="shyExtra" size={13}>
      {title}:
    </StyledText>
    <Text
      size={13}
      color="shyExtra"
      style={{ overflowWrap: 'anywhere' }}
      centerHorizontally
    >
      {value}
    </Text>
  </HStack>
)
