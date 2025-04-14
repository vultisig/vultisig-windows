import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect, useState } from 'react'

const STATE_MACHINE_NAME = 'State Machine 1'
const STATE_INPUT_NAME = 'Switch'

export const useSetupVaultPageAnimation = () => {
  const [isPlaying, setIsPlaying] = useState(false)

  const { RiveComponent, rive } = useRive({
    src: '/assets/animations/choose-vault/index.riv',
    autoplay: true,
    stateMachines: [STATE_MACHINE_NAME],
  })

  const stateMachineInput = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    STATE_INPUT_NAME
  )

  const onPlay = () => setIsPlaying(true)

  useEffect(() => {
    if (!isPlaying) return

    const timeoutId = setTimeout(() => setIsPlaying(false), 1400)

    return () => clearTimeout(timeoutId)
  }, [isPlaying])

  return { RiveComponent, stateMachineInput, isPlaying, onPlay }
}
