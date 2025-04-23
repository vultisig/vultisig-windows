import { match } from '@lib/utils/match'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect } from 'react'

const ANIMATION_END_SCREEN_PERSISTENCE_IN_MS = 2000
type UseWaitForServerAnimationStatesProps = {
  onAnimationEnd?: () => void
  state: 'success' | 'pending' | 'error'
}

export type ServerAnimationStates =
  UseWaitForServerAnimationStatesProps['state']

export const useQueryAnimations = ({
  onAnimationEnd,
  state,
}: UseWaitForServerAnimationStatesProps) => {
  const { RiveComponent, rive } = useRive({
    src: '/assets/animations/spinner.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  })

  const successInput = useStateMachineInput(rive, 'State Machine 1', 'Succes')
  const errorInput = useStateMachineInput(rive, 'State Machine 1', 'Error')

  useEffect(() => {
    if (!rive) return

    const timeoutId = setTimeout(
      () => onAnimationEnd?.(),
      ANIMATION_END_SCREEN_PERSISTENCE_IN_MS
    )
    return () => clearTimeout(timeoutId)
  }, [state, rive, successInput, errorInput, onAnimationEnd])

  useEffect(() => {
    match(state, {
      success: () => successInput?.fire(),
      error: () => errorInput?.fire(),
      pending: () => null,
    })
  }, [errorInput, state, successInput])

  return RiveComponent
}
