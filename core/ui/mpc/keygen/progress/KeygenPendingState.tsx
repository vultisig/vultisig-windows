import { KeygenLoadingAnimation } from '@core/ui/mpc/keygen/progress/KeygenLoadingAnimation'
import { ValueProp } from '@lib/ui/props'
import { KeygenStep } from '@vultisig/core-mpc/keygen/KeygenStep'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

const progressValues: Record<KeygenStep, number> = {
  prepareVault: 15,
  ecdsa: 35,
  eddsa: 55,
  chainKeys: 75,
  mldsa: 85,
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
