import { useEffect, useRef } from 'react'

/** Horizontal travel, in px, that turns a trackpad swipe into a page change. */
const pageThreshold = 60
/**
 * Quiet time that ends a gesture. A trackpad keeps sending momentum events
 * after the fingers lift, so one swipe pages once and its tail is swallowed.
 */
const gestureIdleMs = 180
const lineHeightPx = 16

type UseHorizontalWheelPagingInput = {
  /** `1` towards the next page (content moves left), `-1` towards the previous. */
  onPage: (direction: 1 | -1) => void
  /** Live horizontal travel of a swipe that has not paged yet, in px. */
  onDrag?: (offsetPx: number, elementWidth: number) => void
  /** A swipe ended without paging. */
  onCancel?: () => void
  /** Swipes that start on a matching element are left alone. */
  ignoreSelector?: string
}

/**
 * Pages on two-finger horizontal trackpad swipes (wheel `deltaX`) over the
 * element the returned callback ref is attached to; vertical scrolling and
 * mouse drags are untouched. Each gesture pages at most once.
 */
export const useHorizontalWheelPaging = ({
  onPage,
  onDrag,
  onCancel,
  ignoreSelector,
}: UseHorizontalWheelPagingInput) => {
  const handlers = useRef({ onPage, onDrag, onCancel })

  useEffect(() => {
    handlers.current = { onPage, onDrag, onCancel }
  })

  return (element: HTMLElement | null) => {
    if (!element) return

    let travel = 0
    let hasPaged = false
    let isIgnored = false
    let idleTimeout: ReturnType<typeof setTimeout> | undefined

    const endGesture = () => {
      if (!hasPaged && travel !== 0) handlers.current.onCancel?.()
      travel = 0
      hasPaged = false
      isIgnored = false
      idleTimeout = undefined
    }

    const handleWheel = (event: WheelEvent) => {
      const scale =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE ? lineHeightPx : 1
      const deltaX = event.deltaX * scale
      const isGestureActive = idleTimeout !== undefined

      if (!isGestureActive) {
        if (Math.abs(deltaX) <= Math.abs(event.deltaY)) return
        isIgnored =
          ignoreSelector !== undefined &&
          event.target instanceof Element &&
          event.target.closest(ignoreSelector) !== null
      }

      clearTimeout(idleTimeout)
      idleTimeout = setTimeout(endGesture, gestureIdleMs)

      if (isIgnored) return
      event.preventDefault()
      if (hasPaged) return

      travel += deltaX
      if (Math.abs(travel) >= pageThreshold) {
        hasPaged = true
        handlers.current.onPage(travel > 0 ? 1 : -1)
        return
      }

      handlers.current.onDrag?.(travel, element.clientWidth)
    }

    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      element.removeEventListener('wheel', handleWheel)
      clearTimeout(idleTimeout)
    }
  }
}
