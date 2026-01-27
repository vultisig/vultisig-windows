import { useRive, useStateMachineInput } from '@rive-app/react-webgl2'
import { useEffect, useState } from 'react'

export const useDeviceSelectionAnimation = () => {
  const [selectedDeviceCount, setSelectedDeviceCount] = useState(0)

  const { RiveComponent, rive } = useRive({
    src: '/core/animations/devices-component.riv',
    autoplay: true,
    stateMachines: ['State Machine 1'],
  })

  const indexInput = useStateMachineInput(rive, 'State Machine 1', 'Index')

  useEffect(() => {
    if (indexInput && typeof indexInput.value === 'number') {
      setSelectedDeviceCount(indexInput.value)
    }
  }, [indexInput])

  return { RiveComponent, selectedDeviceCount }
}
