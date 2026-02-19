import {
  Fit,
  Layout,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceNumber,
} from '@rive-app/react-webgl2'
import { useEffect, useRef } from 'react'

import { deviceSelectionAnimationSource } from './getDeviceSelectionAnimationSource'

const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

export const useDeviceSelectionAnimation = () => {
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

  const previousIndexRef = useRef<number | null>(null)

  useEffect(() => {
    const currentIndex = indexProperty?.value ?? 0

    if (
      previousIndexRef.current !== null &&
      previousIndexRef.current !== currentIndex
    ) {
      triggerHapticFeedback()
    }

    previousIndexRef.current = currentIndex
  }, [indexProperty?.value])

  useEffect(() => {
    if (!rive) return
    rive.resizeDrawingSurfaceToCanvas()

    const onResize = () => {
      rive.resizeDrawingSurfaceToCanvas()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [rive])

  return {
    RiveComponent,
    selectedDeviceCount: indexProperty?.value ?? 0,
  }
}
