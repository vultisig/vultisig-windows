import styled from 'styled-components'

import { VStack } from '../../../lib/ui/layout/Stack'
import { Spinner } from '../../../lib/ui/loaders/Spinner'
import { Text } from '../../../lib/ui/text'

export const KeysignSigningState = () => {
  return (
    <VStack flexGrow alignItems="center" justifyContent="center">
      <Wrapper gap={16} alignItems="center" justifyContent="center">
        <Text color="regular" size={22} weight="500">
          {/* TODO: translate when radzion is done with translation file */}
          Signing Transaction
        </Text>
        <Spinner size="2em" />
      </Wrapper>
    </VStack>
  )
}

const Wrapper = styled(VStack)`
  width: 1000px;
  height: 500px;
  border-radius: 50%;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      82deg,
      rgba(51, 230, 191, 0.15) 8.02%,
      rgba(4, 57, 199, 0.15) 133.75%
    );
    filter: blur(50px);
    opacity: 0.5;
    z-index: -1;
  }
`
