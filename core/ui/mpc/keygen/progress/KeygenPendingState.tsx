import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { KeygenLoadingAnimation } from '@core/ui/mpc/keygen/progress/KeygenLoadingAnimation'
import { ValueProp } from '@lib/ui/props'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

const progressValues: Record<KeygenStep, number> = {
  prepareVault: 20,
  ecdsa: 40,
  eddsa: 60,
  mldsa: 80,
}

const getProgress = (step: KeygenStep | null): number => {
  if (!step) return 0
  return progressValues[step] ?? 0
}

export const KeygenPendingState = ({ value }: ValueProp<KeygenStep | null>) => {
  const progress = getProgress(value)

  return (
    <Container>
      <KeygenLoadingAnimation
        isConnected={value !== null}
        progress={progress}
      />
    </Container>
  )
}
