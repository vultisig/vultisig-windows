import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { KeygenProgressIndicator } from '@core/ui/mpc/keygen/progress/KeygenProgressIndicator'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ValueProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import styled from 'styled-components'

import { KeygenProductEducation } from '../education/product/KeygenProductEducation'

export const KeygenPendingState = ({ value }: ValueProp<KeygenStep | null>) => {
  return (
    <PageContent>
      <Wrapper
        flexGrow
        alignItems="center"
        justifyContent="space-between"
        gap={48}
      >
        <VStack flexGrow justifyContent="center">
          <KeygenProductEducation />
        </VStack>
        <KeygenProgressIndicator value={value} />
      </Wrapper>
    </PageContent>
  )
}

const Wrapper = styled(VStack)`
  width: 100%;
  align-self: center;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    width: 550px;
  }
`
