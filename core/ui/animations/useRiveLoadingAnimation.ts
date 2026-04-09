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

type Bounds = {
  width: number
  height: number
}

type UseRiveLoadingAnimationInput = {
  src: string
}

const stateMachineName = 'State Machine 1'

/**
 * Generic hook for Rive loading animations that share the keygen/keysign
 * ViewModel schema (`posXcircles`, `Connected`, `progessPercentage`).
 *
 * The ViewModel input names match the iOS implementation byte-for-byte,
 * including the `progessPercentage` typo from the original Rive file.
 */
export const useRiveLoadingAnimation = ({
  src,
}: UseRiveLoadingAnimationInput) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState<Bounds>({ width: 0, height: 0 })

  const { rive, RiveComponent } = useRive({
    src,
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

  const posXcircles = useViewModelInstanceNumber(
    'posXcircles',
    viewModelInstance
  )

  const progressPercentage = useViewModelInstanceNumber(
    'progessPercentage',
    viewModelInstance
  )

  const connected = useViewModelInstanceBoolean('Connected', viewModelInstance)

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

  useEffect(() => {
    if (bounds.width === 0 || !posXcircles) return
    posXcircles.setValue(bounds.width / 2)
  }, [bounds.width, posXcircles])

  useEffect(() => {
    if (!rive) return
    // Object.assign is used (instead of `rive.volume = 0`) to bypass
    // react-compiler's mutation rule for values returned from hooks.
    Object.assign(rive, { volume: 0 })
  }, [rive])

  useEffect(() => {
    if (!rive) return
    rive.resizeDrawingSurfaceToCanvas()

    const onResize = () => {
      rive.resizeDrawingSurfaceToCanvas()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [rive])

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
    viewModelInstance,
  }
}
