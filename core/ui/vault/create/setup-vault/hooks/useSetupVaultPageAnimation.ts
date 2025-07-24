import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useCallback, useEffect, useState } from 'react'

const stateMachineName = 'State Machine 1'
const stateInputName = 'Switch'

export const useSetupVaultPageAnimation = () => {
  const [isPlaying, setIsPlaying] = useState(false)

  const { RiveComponent, rive } = useRive({
    src: '/core/animations/choose-vault.riv',
    autoplay: true,
    stateMachines: [stateMachineName],
  })

  const stateMachineInput = useStateMachineInput(
    rive,
    stateMachineName,
    stateInputName
  )

  const onPlay = useCallback(() => {
    stateMachineInput?.fire()
    setIsPlaying(true)
  }, [stateMachineInput])

  useEffect(() => {
    if (!isPlaying) return
    const timeoutId = setTimeout(() => setIsPlaying(false), 1400)
    return () => clearTimeout(timeoutId)
  }, [isPlaying])

  return {
    RiveComponent: RiveComponent,
    isPlaying,
    onPlay,
  }
}
