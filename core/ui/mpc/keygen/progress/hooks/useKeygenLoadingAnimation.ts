import {
  Fit,
  Layout,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceBoolean,
  useViewModelInstanceNumber,
} from '@rive-app/react-webgl2'
import { useCallback, useEffect, useRef, useState } from 'react'

type Bounds = {
  width: number
  height: number
}

const stateMachineName = 'State Machine 1'

export const useKeygenLoadingAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState<Bounds>({ width: 0, height: 0 })

  const { rive, RiveComponent } = useRive({
    src: '/core/animations/keygen_loading.riv',
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

  // Number inputs for circle Y positions
  const posYcircle1 = useViewModelInstanceNumber(
    'posYcircle1',
    viewModelInstance
  )
  const posYcircle2 = useViewModelInstanceNumber(
    'posYcircle2',
    viewModelInstance
  )
  const posYcircle3 = useViewModelInstanceNumber(
    'posYcircle3',
    viewModelInstance
  )
  const posYcircle4 = useViewModelInstanceNumber(
    'posYcircle4',
    viewModelInstance
  )
  const posYcircle5 = useViewModelInstanceNumber(
    'posYcircle5',
    viewModelInstance
  )

  // Number input for X position (center)
  const posXcircles = useViewModelInstanceNumber(
    'posXcircles',
    viewModelInstance
  )

  // Boolean input for connection state
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

  // Update X position when bounds change (center the circles)
  useEffect(() => {
    if (bounds.width === 0 || !posXcircles) return
    posXcircles.setValue(bounds.width / 2)
  }, [bounds.width, posXcircles])

  // Update Y positions based on container bounds using requestAnimationFrame
  // The animation needs positions calculated at each frame based on:
  // - deviceTopYPosition (0) and deviceBottomYPosition (height)
  // - The animation's internal timeline (260 frames at 60fps = ~4.33s loop)
  //
  // Circle positions at frame 0 per designer spec:
  // posYcircle1: deviceTopY + 25.5
  // posYcircle2: deviceTopY - 143.2
  // posYcircle3: deviceTopY - 117.5
  // posYcircle4: deviceTopY - 111
  // posYcircle5: deviceTopY - 198.5
  //
  // At middle frames they move to bottom positions
  useEffect(() => {
    if (bounds.height === 0) return

    const deviceTopY = 0
    const deviceBottomY = bounds.height
    const fps = 60
    const totalFrames = 260
    const totalDuration = totalFrames / fps // ~4.333s

    // Keyframe times in seconds
    const kf = {
      // posYcircle1 keyframes
      c1_0: 0 / fps,
      c1_1: 122 / fps,
      c1_2: 136 / fps,
      c1_3: 242 / fps,
      // posYcircle2 keyframes
      c2_0: 0 / fps,
      c2_1: 103 / fps,
      c2_2: 136 / fps,
      c2_3: 253 / fps,
      // posYcircle3 keyframes
      c3_0: 0 / fps,
      c3_1: 93 / fps,
      c3_2: 136 / fps,
      c3_3: 257 / fps,
      // posYcircle4 keyframes
      c4_0: 0 / fps,
      c4_1: 82 / fps,
      c4_2: 136 / fps,
      c4_3: 262 / fps,
      // posYcircle5 keyframes
      c5_0: 0 / fps,
      c5_1: 107 / fps,
      c5_2: 136 / fps,
      c5_3: 260 / fps,
    }

    // Circle position values per designer spec
    const positions = {
      c1: { top: deviceTopY + 25.5, bottom: deviceBottomY - 331.5 },
      c2: { top: deviceTopY - 143.2, bottom: deviceBottomY - 146 },
      c3: { top: deviceTopY - 117.5, bottom: deviceBottomY - 209 },
      c4: { top: deviceTopY - 111, bottom: deviceBottomY - 193.5 },
      c5: { top: deviceTopY - 198.5, bottom: deviceBottomY - 83.5 },
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const getPosYcircle = (
      t: number,
      topVal: number,
      bottomVal: number,
      kf0: number,
      kf1: number,
      kf2: number,
      kf3: number
    ) => {
      // Loop time
      const loopT = ((t % totalDuration) + totalDuration) % totalDuration

      // Move from top to bottom
      if (loopT <= kf1) {
        const u = (loopT - kf0) / (kf1 - kf0)
        return lerp(topVal, bottomVal, u)
      }
      // Hold at bottom
      if (loopT <= kf2) {
        return bottomVal
      }
      // Move from bottom back to top
      if (loopT <= kf3) {
        const u = (loopT - kf2) / (kf3 - kf2)
        return lerp(bottomVal, topVal, u)
      }
      // Hold at top until loop end
      return topVal
    }

    let frameId: number
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000

      if (posYcircle1) {
        posYcircle1.setValue(
          getPosYcircle(
            elapsed,
            positions.c1.top,
            positions.c1.bottom,
            kf.c1_0,
            kf.c1_1,
            kf.c1_2,
            kf.c1_3
          )
        )
      }
      if (posYcircle2) {
        posYcircle2.setValue(
          getPosYcircle(
            elapsed,
            positions.c2.top,
            positions.c2.bottom,
            kf.c2_0,
            kf.c2_1,
            kf.c2_2,
            kf.c2_3
          )
        )
      }
      if (posYcircle3) {
        posYcircle3.setValue(
          getPosYcircle(
            elapsed,
            positions.c3.top,
            positions.c3.bottom,
            kf.c3_0,
            kf.c3_1,
            kf.c3_2,
            kf.c3_3
          )
        )
      }
      if (posYcircle4) {
        posYcircle4.setValue(
          getPosYcircle(
            elapsed,
            positions.c4.top,
            positions.c4.bottom,
            kf.c4_0,
            kf.c4_1,
            kf.c4_2,
            kf.c4_3
          )
        )
      }
      if (posYcircle5) {
        posYcircle5.setValue(
          getPosYcircle(
            elapsed,
            positions.c5.top,
            positions.c5.bottom,
            kf.c5_0,
            kf.c5_1,
            kf.c5_2,
            kf.c5_3
          )
        )
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [
    bounds.height,
    posYcircle1,
    posYcircle2,
    posYcircle3,
    posYcircle4,
    posYcircle5,
  ])

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

  const setConnected = useCallback(
    (value: boolean) => {
      connected?.setValue(value)
    },
    [connected]
  )

  return {
    RiveComponent,
    containerRef,
    setConnected,
    isLoading: !rive,
    bounds,
  }
}
