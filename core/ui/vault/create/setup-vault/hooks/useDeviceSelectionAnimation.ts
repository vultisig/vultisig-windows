import {
  Fit,
  Layout,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceNumber,
} from '@rive-app/react-webgl2'
import { useEffect, useRef } from 'react'

import { deviceSelectionAnimationSource } from './deviceSelectionAnimationSource'

const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

const maxDeviceSelectionIndex = 3

type UseDeviceSelectionAnimationInput = {
  /** Rive `Index` to seed the slider with once the animation loads. */
  initialIndex?: number
}

export const useDeviceSelectionAnimation = ({
  initialIndex,
}: UseDeviceSelectionAnimationInput = {}) => {
  const { RiveComponent, rive } = useRive({
    src: `/core/animations/${deviceSelectionAnimationSource}.riv`,
    autoplay: true,
    // The state-machine handlers use the default view model. Bind it before
    // Rive exposes the interactive canvas, rather than after React effects run.
    autoBind: true,
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

  const setSelectedDeviceCount = (count: number) => {
    if (indexProperty.value === null) return

    const selectedDeviceCount = Math.min(
      Math.max(0, Math.round(count)),
      maxDeviceSelectionIndex
    )

    // `autoBind` owns the instance the state machine renders. Keep its
    // property and the React observer in sync when the slider is dragged.
    const boundIndexProperty = rive?.viewModelInstance?.number('Index')
    if (boundIndexProperty) {
      boundIndexProperty.value = selectedDeviceCount
    }

    indexProperty.setValue(selectedDeviceCount)
  }

  const didSeedRef = useRef(false)

  useEffect(() => {
    if (
      initialIndex === undefined ||
      didSeedRef.current ||
      indexProperty.value === null
    ) {
      return
    }

    // `autoBind` renders from Rive's bound default instance. Seed that
    // instance too so revisiting this screen preserves the visible selection.
    const boundIndexProperty = rive?.viewModelInstance?.number('Index')
    if (boundIndexProperty) {
      boundIndexProperty.value = initialIndex
    }

    indexProperty.setValue(initialIndex)
    didSeedRef.current = true
  }, [initialIndex, indexProperty, rive])

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
    setSelectedDeviceCount,
  }
}
