import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

type Props = {
  chain: string
  onSelect?: (key: string) => void
}

const strokeAdditionalSpace = 12
const minStrokeWidth = 44
const idleTimeAfterScrollStop = 500
const wheelIdleTime = 200
const behavior: ScrollBehavior = 'smooth'

export const useCenteredSnapCarousel = ({ chain, onSelect }: Props) => {
  const footerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevChain = useRef<string | null>(null)
  const strokeRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<number | null>(null)
  // Target scrollLeft of an in-flight programmatic scroll (click / settle /
  // chain-change centering). While set, live ring tracking is suppressed, so
  // only genuine user scrolls (wheel, touch, scrollbar) drive the live resize.
  // Cleared once the target is reached, or on any direct user input.
  const programmaticTarget = useRef<number | null>(null)
  const wheelIdleTimer = useRef<number | null>(null)
  // Pre-measured center (in scroll-content coordinates) and width of every pill,
  // so during a scroll we can resize the ring to the pill entering the center
  // without measuring the DOM on each scroll event.
  const chainMetrics = useRef<
    { chain: string; center: number; width: number }[]
  >([])
  const viewportWidth = useRef(0)

  const computeCenteredLeft = useCallback(
    (container: HTMLDivElement, el: HTMLDivElement) => {
      const cRect = container.getBoundingClientRect()
      const eRect = el.getBoundingClientRect()
      const delta =
        eRect.left - cRect.left - (container.clientWidth - eRect.width) / 2
      const maxLeft = container.scrollWidth - container.clientWidth

      return Math.min(Math.max(0, container.scrollLeft + delta), maxLeft)
    },
    []
  )

  const scrollToKey = useCallback(
    (key: string, b?: ScrollBehavior) => {
      const container = footerRef.current
      const el = itemRefs.current[key]
      if (!container || !el) return
      const left = computeCenteredLeft(container, el)
      if (Math.abs(container.scrollLeft - left) > 1) {
        // Mark this as programmatic so the live ring tracking ignores the scroll
        // events it produces (cleared in onScroll once it lands).
        programmaticTarget.current = left
        container.scrollTo({ left, behavior: b ?? behavior })
      }
    },
    [computeCenteredLeft]
  )

  const setStrokeToKey = useCallback(
    (key?: string) => {
      const container = footerRef.current
      const stroke = strokeRef.current
      const el = key
        ? itemRefs.current[key]
        : chain
          ? itemRefs.current[chain]
          : null

      if (!container || !stroke || !el) return

      const r = el.getBoundingClientRect()
      const width = Math.max(
        minStrokeWidth,
        Math.ceil(r.width + strokeAdditionalSpace)
      )

      stroke.style.width = `${width}px`
    },
    [chain]
  )

  // Cache every pill's center + width once (scroll-invariant content coords), so
  // the scroll handler can look them up instead of measuring the DOM mid-scroll.
  const measureMetrics = useCallback(() => {
    const container = footerRef.current
    if (!container) return

    const containerLeft = container.getBoundingClientRect().left
    viewportWidth.current = container.clientWidth

    const metrics: { chain: string; center: number; width: number }[] = []
    for (const [key, el] of Object.entries(itemRefs.current)) {
      if (!el) continue
      const r = el.getBoundingClientRect()
      metrics.push({
        chain: key,
        center: r.left - containerLeft + container.scrollLeft + r.width / 2,
        width: r.width,
      })
    }
    chainMetrics.current = metrics
  }, [])

  // Resize the ring to the pill nearest the viewport center, using cached widths
  // and only the live scrollLeft — so the ring snaps to the next pill the instant
  // it crosses the center while scrolling.
  const setStrokeToNearestScrollPosition = useCallback(() => {
    const container = footerRef.current
    const stroke = strokeRef.current
    if (!container || !stroke || chainMetrics.current.length === 0) return

    const center = container.scrollLeft + viewportWidth.current / 2

    let best: (typeof chainMetrics.current)[number] | null = null
    let bestDist = Infinity
    for (const metric of chainMetrics.current) {
      const dist = Math.abs(metric.center - center)
      if (dist < bestDist) {
        bestDist = dist
        best = metric
      }
    }
    if (!best) return

    const width = Math.max(
      minStrokeWidth,
      Math.ceil(best.width + strokeAdditionalSpace)
    )
    stroke.style.width = `${width}px`
  }, [])

  const selectNearest = useCallback(() => {
    const container = footerRef.current
    if (!container) return
    const target = strokeRef.current ?? container
    const tRect = target.getBoundingClientRect()
    const centerX = tRect.left + tRect.width / 2

    let bestKey: string | null = null
    let bestDist = Infinity

    for (const [key, el] of Object.entries(itemRefs.current)) {
      if (!el) continue
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const d = Math.abs(cx - centerX)
      if (d < bestDist) {
        bestDist = d
        bestKey = key
      }
    }

    if (bestKey && bestKey !== chain) onSelect?.(bestKey)
    if (bestKey) {
      setStrokeToKey(bestKey)
      scrollToKey(bestKey)
    } else {
      setStrokeToKey(chain)
      scrollToKey(chain)
    }
  }, [chain, onSelect, scrollToKey, setStrokeToKey])

  useLayoutEffect(() => {
    if (!chain) return

    measureMetrics()
    setStrokeToKey(chain)

    const b: ScrollBehavior =
      prevChain.current && prevChain.current !== chain ? behavior : 'auto'
    scrollToKey(chain, b)

    prevChain.current = chain

    const id = requestAnimationFrame(() => {
      measureMetrics()
      setStrokeToKey(chain)
      scrollToKey(chain, b)
    })

    return () => cancelAnimationFrame(id)
  }, [chain, measureMetrics, scrollToKey, setStrokeToKey])

  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    const onScroll = () => {
      if (programmaticTarget.current !== null) {
        // A click/settle/chain-change scroll is in flight: don't track, and drop
        // the marker once it lands so user scrolls resume driving the ring.
        if (Math.abs(el.scrollLeft - programmaticTarget.current) <= 1) {
          programmaticTarget.current = null
        }
      } else {
        // Any user-driven scroll (wheel, touch, or scrollbar): resize the ring
        // to the pill entering the center as it moves, in parallel with the list.
        setStrokeToNearestScrollPosition()
      }

      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(
        selectNearest,
        idleTimeAfterScrollStop
      )
    }

    const onWheel = (e: WheelEvent) => {
      // Direct user input cancels an in-flight programmatic classification (e.g.
      // interrupting a smooth scroll) so tracking resumes immediately — and a
      // boundary wheel that produces no scroll event can't leave anything stuck.
      programmaticTarget.current = null
      // Refresh the cached widths at the start of a wheel gesture: the mount-time
      // measurement can be stale (fonts/icons finalize after it), which made the
      // ring size wrong for the next pill on the very first scroll.
      if (wheelIdleTimer.current === null) {
        measureMetrics()
      } else {
        window.clearTimeout(wheelIdleTimer.current)
      }
      wheelIdleTimer.current = window.setTimeout(() => {
        wheelIdleTimer.current = null
      }, wheelIdleTime)

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY
      }
    }

    const onPointerDown = () => {
      // Touch/pointer gesture start: cancel any programmatic marker and refresh
      // widths so touch swipes and scrollbar drags also track the ring live.
      programmaticTarget.current = null
      measureMetrics()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('pointerdown', onPointerDown, { passive: true })

    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current)
      if (wheelIdleTimer.current !== null) {
        window.clearTimeout(wheelIdleTimer.current)
      }
    }
  }, [measureMetrics, selectNearest, setStrokeToNearestScrollPosition])

  useEffect(() => {
    const onResize = () => {
      measureMetrics()
      setStrokeToKey()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measureMetrics, setStrokeToKey])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      const keys = Object.keys(itemRefs.current)
      const idx = keys.findIndex(k => k === chain)
      if (idx < 0) return
      const nextIdx =
        e.key === 'ArrowLeft'
          ? Math.max(0, idx - 1)
          : Math.min(keys.length - 1, idx + 1)
      const next = keys[nextIdx]
      if (next && next !== chain) {
        onSelect?.(next)
        setStrokeToKey(next)
        scrollToKey(next)
      }
    },
    [chain, onSelect, scrollToKey, setStrokeToKey]
  )

  const setItemRef = useCallback((key: string, el: HTMLDivElement | null) => {
    itemRefs.current[key] = el
  }, [])

  return {
    footerRef,
    itemRefs,
    scrollToKey,
    strokeRef,
    onKeyDown,
    setItemRef,
  }
}
