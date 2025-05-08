import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback, useEffect, useState } from 'react'

const STATE_MACHINE_NAME = 'State Machine 1'
const STATE_INPUT_NAME = 'Switch'

// @antonio: required by product to switch animation initially. If switched too fast, the animation breaks we need a delay.
const INITIAL_SWITCH_DELAY_MS = 360

export const useSetupVaultPageAnimation = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const { RiveComponent, rive } = useRive({
    src: '/core/animations/choose-vault.riv',
    autoplay: true,
    stateMachines: [STATE_MACHINE_NAME],
  })

  const stateMachineInput = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    STATE_INPUT_NAME
  )

  useEffect(() => {
    if (!stateMachineInput) return

    setTimeout(() => {
      stateMachineInput?.fire()
      setIsReady(true)
    }, INITIAL_SWITCH_DELAY_MS)
  }, [stateMachineInput])

  const onPlay = useCallback(() => {
    setIsReady(true)
    stateMachineInput?.fire()
    setIsPlaying(true)
  }, [stateMachineInput])

  useEffect(() => {
    if (!isPlaying) return
    const timeoutId = setTimeout(() => setIsPlaying(false), 1400)
    return () => clearTimeout(timeoutId)
  }, [isPlaying])

  return {
    isReady,
    RiveComponent: RiveComponent,
    isPlaying,
    onPlay,
  }
}
