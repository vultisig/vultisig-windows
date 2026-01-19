import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { KeygenLoadingAnimation } from '@core/ui/mpc/keygen/progress/KeygenLoadingAnimation'
import { KeygenProgressIndicator } from '@core/ui/mpc/keygen/progress/KeygenProgressIndicator'
import { VStack } from '@lib/ui/layout/Stack'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ValueProp } from '@lib/ui/props'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

const ContentArea = styled.div`
  position: relative;
  flex: 1;
  z-index: 1;
`

export const KeygenPendingState = ({ value }: ValueProp<KeygenStep | null>) => {
  return (
    <Container>
      <KeygenLoadingAnimation isConnected={value !== null} />
      <ContentArea />
      <PageFooter alignItems="center">
        <VStack alignItems="center" maxWidth={576} fullWidth>
          <KeygenProgressIndicator value={value} />
        </VStack>
      </PageFooter>
    </Container>
  )
}
