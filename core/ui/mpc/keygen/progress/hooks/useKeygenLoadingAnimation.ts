import { getOnboardingMpcAnimationPath } from '@core/ui/mpc/animations/onboardingMpcAnimationSources'
import { useMpcSigners } from '@core/ui/mpc/devices/state/signers'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import {
  Fit,
  Layout,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceBoolean,
  useViewModelInstanceNumber,
} from '@rive-app/react-webgl2'
import { useEffect, useRef, useState } from 'react'

import { getKeygenLoadingAnimationSource } from './getKeygenLoadingAnimationSource'

type Bounds = {
  width: number
  height: number
}

const stateMachineName = 'State Machine 1'

export const useKeygenLoadingAnimation = () => {
  const signers = useMpcSigners()
  const isInitiatingDevice = useIsInitiatingDevice()
  const animationSource = getKeygenLoadingAnimationSource({
    isInitiatingDevice,
    signers,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState<Bounds>({ width: 0, height: 0 })

  const { rive, RiveComponent } = useRive({
    src: getOnboardingMpcAnimationPath(animationSource),
    stateMachines: stateMachineName,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Layout,
    }),
  })

  const viewModel = useViewModel(rive, { useDefault: true })

  const viewModelInstance = useViewModelInstance(viewModel, {
    useDefault: true,
    rive,
  })

  // Number input for X position (center) - matches iOS: posXcircles
  const posXcircles = useViewModelInstanceNumber(
    'posXcircles',
    viewModelInstance
  )

  // Number input for progress percentage - matches iOS: progessPercentage (note typo in original)
  const progressPercentage = useViewModelInstanceNumber(
    'progessPercentage',
    viewModelInstance
  )

  // Boolean input for connection state - matches iOS: Connected
  const connected = useViewModelInstanceBoolean('Connected', viewModelInstance)

  // Measure container bounds
  useEffect(() => {
    if (!containerRef.current) return

    const measureBounds = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setBounds({ width: rect.width, height: rect.height })
    }

    measureBounds()

    const observer = new ResizeObserver(() => {
      measureBounds()
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  // Update X position when bounds change (center the circles) - matches iOS implementation
  useEffect(() => {
    if (bounds.width === 0 || !posXcircles) return
    posXcircles.setValue(bounds.width / 2)
  }, [bounds.width, posXcircles])

  // Handle resize for drawing surface
  useEffect(() => {
    if (!rive) return
    rive.resizeDrawingSurfaceToCanvas()

    const onResize = () => {
      rive.resizeDrawingSurfaceToCanvas()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [rive])

  // Ensure animation keeps playing
  useEffect(() => {
    if (!rive) return

    const id = window.setInterval(() => {
      if (rive && !rive.isPlaying) {
        rive.play()
      }
    }, 100)

    return () => window.clearInterval(id)
  }, [rive])

  const setConnected = (value: boolean) => {
    connected?.setValue(value)
  }

  const setProgress = (value: number) => {
    progressPercentage?.setValue(value)
  }

  return {
    RiveComponent,
    containerRef,
    setConnected,
    setProgress,
    isLoading: !rive,
    bounds,
  }
}
