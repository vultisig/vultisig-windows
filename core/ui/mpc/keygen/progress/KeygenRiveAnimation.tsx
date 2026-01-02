import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceBoolean,
  useViewModelInstanceNumber,
} from '@rive-app/react-canvas'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
`

type Props = {
  progressPercentage?: number
}

export const KeygenRiveAnimation = ({ progressPercentage = 0 }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const { rive, RiveComponent } = useRive({
    src: '/core/animations/keygen_animation.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  })

  const viewModel = useViewModel(rive, { useDefault: true })
  const viewModelInstance = useViewModelInstance(viewModel, {
    useDefault: true,
    rive,
  })

  const connected = useViewModelInstanceBoolean('Connected', viewModelInstance)
  const posXcircles = useViewModelInstanceNumber(
    'posXcircles',
    viewModelInstance
  )
  const progessPercentage = useViewModelInstanceNumber(
    'progessPercentage',
    viewModelInstance
  )

  useEffect(() => {
    if (!containerRef.current) return

    const el = containerRef.current
    const ro = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect
      if (!rect) return
      setSize({ width: rect.width, height: rect.height })
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!rive) return
    rive.resizeDrawingSurfaceToCanvas()
  }, [rive, size.width, size.height])

  useEffect(() => {
    if (!rive) return
    const interval = setInterval(() => {
      if (!rive.isPlaying) {
        rive.play()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [rive])

  useEffect(() => {
    if (!viewModelInstance) return
    if (connected?.setValue) {
      connected.setValue(true)
    }
  }, [viewModelInstance, connected])

  useEffect(() => {
    if (!viewModelInstance) return
    if (size.width <= 0) return
    if (posXcircles?.setValue) {
      posXcircles.setValue(size.width / 2)
    }
  }, [viewModelInstance, posXcircles, size.width])

  useEffect(() => {
    if (!viewModelInstance) return
    if (progessPercentage?.setValue) {
      progessPercentage.setValue(progressPercentage)
    }
  }, [progressPercentage, viewModelInstance, progessPercentage])

  return (
    <Wrapper ref={containerRef}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </Wrapper>
  )
}
