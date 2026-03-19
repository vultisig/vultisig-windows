import {
  Fit,
  Layout,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceNumber,
} from '@rive-app/react-webgl2'
import { useCallback, useEffect, useState } from 'react'

import { deviceSelectionAnimationSource } from './deviceSelectionAnimationSource'

const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

export const useDeviceSelectionAnimation = () => {
  const [selectedDeviceCount, setSelectedDeviceCountState] = useState(0)

  const { RiveComponent, rive } = useRive({
    src: `/core/animations/${deviceSelectionAnimationSource}.riv`,
    autoplay: true,
    stateMachines: ['State Machine 1'],
    layout: new Layout({
      fit: Fit.Layout,
    }),
  })

  const viewModel = useViewModel(rive, { useDefault: true })

  const viewModelInstance = useViewModelInstance(viewModel, {
    useDefault: true,
    rive,
  })

  const indexProperty = useViewModelInstanceNumber('Index', viewModelInstance)

  useEffect(() => {
    if (indexProperty) {
      indexProperty.setValue(selectedDeviceCount)
    }
  }, [selectedDeviceCount, indexProperty])

  useEffect(() => {
    if (!rive) return
    rive.resizeDrawingSurfaceToCanvas()

    const onResize = () => {
      rive.resizeDrawingSurfaceToCanvas()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [rive])

  const setSelectedDeviceCount = useCallback((count: number) => {
    triggerHapticFeedback()
    setSelectedDeviceCountState(count)
  }, [])

  return {
    RiveComponent,
    selectedDeviceCount,
    setSelectedDeviceCount,
  }
}
